import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import Batch from "@/models/Batch";
import Farm from "@/models/Farm";

const schema = z.object({
  farmId: z.string().min(1),
  batchName: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id")!;
  const role = req.headers.get("x-user-role")!;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (role !== "farmer") return err("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  const { farmId, batchName } = parsed.data;

  await connectDB();

  const farm = await Farm.findOne({ farmId });
  if (!farm) return err("Farm not found", 404);

  const batchId = `batch_${crypto.randomUUID()}`;
  const batch = await Batch.create({
    batchId,
    farmId,
    batchName,
    startDate: new Date(),
    status: "active",
    overallScore: 0,
    overallGrade: "C",
    approvalStatus: "pending",
    dataPoints: 0,
  });

  await writeAuditLog(userId, "batch_created", "batch", ip, { resourceId: batchId });

  return ok({ batchId: batch.batchId, startDate: batch.startDate, status: batch.status }, 201);
}
