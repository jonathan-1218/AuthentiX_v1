import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import Batch from "@/models/Batch";

export async function POST(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  const userId = req.headers.get("x-user-id")!;
  const role = req.headers.get("x-user-role")!;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (role !== "farmer") return err("Forbidden", 403);

  await connectDB();

  const batch = await Batch.findOne({ batchId: params.batchId });
  if (!batch) return err("Batch not found", 404);
  if (batch.status !== "active") return err("Only active batches can be submitted", 400);

  batch.status = "harvested";
  batch.approvalStatus = "pending";
  await batch.save();

  await writeAuditLog(userId, "certification_submitted", "batch", ip, { resourceId: params.batchId });

  return ok({ success: true, submissionId: params.batchId, status: "pending" });
}
