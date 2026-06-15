import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { calculateComplianceScore } from "@/lib/certification";
import { ok, err } from "@/lib/api-response";
import SensorData from "@/models/SensorData";
import Batch from "@/models/Batch";

const schema = z.object({ batchId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role")!;
  if (role !== "admin") return err("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  await connectDB();

  const readings = await SensorData.find({ batchId: parsed.data.batchId }).lean();
  if (readings.length === 0) return err("No sensor data for this batch", 404);

  const report = calculateComplianceScore(
    readings.map((r) => ({ ...r, timestamp: new Date(r.timestamp) }))
  );

  await Batch.findOneAndUpdate(
    { batchId: parsed.data.batchId },
    { overallScore: report.complianceScore, overallGrade: report.grade }
  );

  return ok({ ...report });
}
