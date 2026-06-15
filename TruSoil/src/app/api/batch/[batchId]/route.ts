import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import Batch from "@/models/Batch";
import SensorData from "@/models/SensorData";

export async function GET(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  const { batchId } = params;

  await connectDB();

  const batch = await Batch.findOne({ batchId }).lean();
  if (!batch) return err("Batch not found", 404);

  const sensorData = await SensorData.find({ batchId }).sort({ timestamp: 1 }).lean();

  return ok({ batch, sensorData });
}
