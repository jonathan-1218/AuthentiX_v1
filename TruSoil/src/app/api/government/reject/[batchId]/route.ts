import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import Batch from "@/models/Batch";

const schema = z.object({ reason: z.string().min(1, "Rejection reason is required") });

export async function POST(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  const userId = req.headers.get("x-user-id")!;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  await connectDB();

  const batch = await Batch.findOne({ batchId: params.batchId });
  if (!batch) return err("Batch not found", 404);

  batch.approvalStatus = "rejected";
  batch.status = "rejected";
  batch.governmentOfficerId = userId;
  await batch.save();

  await writeAuditLog(userId, "batch_rejected", "batch", ip, {
    resourceId: params.batchId,
    details: { reason: parsed.data.reason },
  });

  return ok({ success: true, rejectionId: params.batchId });
}
