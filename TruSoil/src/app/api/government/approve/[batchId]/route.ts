import { NextRequest } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import Batch from "@/models/Batch";
import SensorData from "@/models/SensorData";
import { uploadToBlockchain } from "@/lib/blockchain";
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

  const readings = await SensorData.find({ batchId: params.batchId }).sort({ timestamp: 1 }).lean();
  const merkleRoot = buildMerkleRoot(
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
  const verifyUrl = `${appUrl}/verify/${params.batchId}`;
  const qrCode = await QRCode.toDataURL(verifyUrl);

  const txResult = await uploadToBlockchain({
    farmId: batch.farmId,
    batchId: batch.batchId,
    merkleRoot,
    complianceScore: batch.overallScore,
    grade: batch.overallGrade,
  });

  batch.status = "certified";
  batch.approvalStatus = "approved";
  batch.governmentOfficerId = userId;
  batch.qrCode = qrCode;
  batch.blockchainAddress = txResult.transactionHash;
  batch.endDate = new Date();
  await batch.save();

  await writeAuditLog(userId, "batch_approved", "batch", ip, {
    resourceId: params.batchId,
    details: { comment: parsed.success ? parsed.data.comment : undefined, txHash: txResult.transactionHash },
  });

  return ok({
    success: true,
    qrCode,
    certificateId: params.batchId,
    transactionHash: txResult.transactionHash,
    blockNumber: txResult.blockNumber,
  });
}
