import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { uploadToBlockchain } from "@/lib/blockchain";
import { buildMerkleRoot } from "@/lib/merkle";
import { ok, err } from "@/lib/api-response";
import SensorData from "@/models/SensorData";
import Batch from "@/models/Batch";

const schema = z.object({ batchId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role")!;
  if (role !== "admin" && role !== "government_officer") return err("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  await connectDB();

  const batch = await Batch.findOne({ batchId: parsed.data.batchId });
  if (!batch) return err("Batch not found", 404);

  const readings = await SensorData.find({ batchId: parsed.data.batchId }).sort({ timestamp: 1 }).lean();
  if (readings.length === 0) return err("No sensor data for this batch", 400);

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

  const result = await uploadToBlockchain({
    farmId: batch.farmId,
    batchId: batch.batchId,
    merkleRoot,
    complianceScore: batch.overallScore,
    grade: batch.overallGrade,
  });

  return ok(result);
}
