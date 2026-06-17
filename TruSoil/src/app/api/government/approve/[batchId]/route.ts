import { NextRequest } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import Batch from "@/models/Batch";
import SensorData from "@/models/SensorData";
import { buildMerkleRoot } from "@/lib/merkle";

const schema = z.object({ comment: z.string().optional() });

export async function POST(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  const userId = req.headers.get("x-user-id")!;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  const parsed = schema.safeParse(body);

  await connectDB();

  const batch = await Batch.findOne({ batchId: params.batchId });
  if (!batch) return err("Batch not found", 404);

  const readings = await SensorData.find({ batchId: params.batchId })
    .sort({ timestamp: 1 })
    .lean();

  // Compute a local Merkle root of this batch's readings for audit trail.
  // The batch's daily readings will be rolled into the monthly on-chain root by the nightly cron.
  const batchMerkleRoot = buildMerkleRoot(
    readings.map((r) => ({
      farmId: r.farmId,
      batchId: r.batchId,
      timestamp: new Date(r.timestamp).toISOString(),
      temperature: r.temperature,
      humidity: r.humidity,
      soilMoisture: r.soilMoisture,
      pH: r.pH,
      pesticide: r.pesticide,
      rain: r.rain,
    }))
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qrCode = await QRCode.toDataURL(`${appUrl}/verify/${params.batchId}`);

  batch.status = "certified";
  batch.approvalStatus = "approved";
  batch.governmentOfficerId = userId;
  batch.qrCode = qrCode;
  batch.blockchainAddress = batchMerkleRoot; // local root; on-chain via monthly cron
  batch.endDate = new Date();
  await batch.save();

  await writeAuditLog(userId, "batch_approved", "batch", ip, {
    resourceId: params.batchId,
    details: {
      comment: parsed.success ? parsed.data.comment : undefined,
      merkleRoot: batchMerkleRoot,
    },
  });

  return ok({
    success: true,
    qrCode,
    certificateId: params.batchId,
    merkleRoot: batchMerkleRoot,
    note: "Batch approved. Sensor readings will be anchored on-chain in the next monthly Merkle root.",
  });
}
