import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import BlockchainRecord from "@/models/BlockchainRecord";
import SensorData from "@/models/SensorData";
import { buildMerkleRoot } from "@/lib/merkle";

export async function POST(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  await connectDB();

  const onChain = await BlockchainRecord.findOne({ batchId: params.batchId });
  if (!onChain) return err("No blockchain record found for this batch", 404);

  const readings = await SensorData.find({ batchId: params.batchId }).sort({ timestamp: 1 }).lean();
  if (readings.length === 0) return err("No sensor data found", 404);

  const calculatedRoot = buildMerkleRoot(
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

  const match = calculatedRoot === onChain.merkleRoot;

  return ok({
    verified: match,
    calculatedRoot,
    blockchainRoot: onChain.merkleRoot,
    match,
    dataPoints: readings.length,
  });
}
