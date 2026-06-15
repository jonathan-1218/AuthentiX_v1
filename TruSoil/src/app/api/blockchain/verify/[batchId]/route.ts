import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import { verifyOnChain } from "@/lib/blockchain";
import { buildMerkleRoot } from "@/lib/merkle";
import SensorData from "@/models/SensorData";
import BlockchainRecord from "@/models/BlockchainRecord";

export async function GET(
  _req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  await connectDB();

  const [onChain, dbRecord, readings] = await Promise.all([
    verifyOnChain(params.batchId),
    BlockchainRecord.findOne({ batchId: params.batchId }).lean(),
    SensorData.find({ batchId: params.batchId }).sort({ timestamp: 1 }).lean(),
  ]);

  if (!onChain) return err("Batch not found on blockchain", 404);

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
    blockchainData: onChain,
    dbRecord,
    calculatedRoot,
    matchStatus: match ? "DATA_INTACT" : "DATA_TAMPERED",
  });
}
