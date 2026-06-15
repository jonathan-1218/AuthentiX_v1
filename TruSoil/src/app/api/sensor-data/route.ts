import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { calculateComplianceScore } from "@/lib/certification";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import SensorData from "@/models/SensorData";
import Batch from "@/models/Batch";

const schema = z.object({
  batchId: z.string().min(1),
  farmId: z.string().min(1),
  temperature: z.number().min(-10).max(60),
  humidity: z.number().min(0).max(100),
  soilMoisture: z.number().min(0).max(100),
  pH: z.number().min(0).max(14),
  pesticide: z.number().min(0).max(100),
  rain: z.number().min(0),
  timestamp: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id")!;
  const role = req.headers.get("x-user-role")!;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (role !== "farmer" && role !== "admin") return err("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  const { batchId, farmId, timestamp, ...readings } = parsed.data;

  await connectDB();

  const batch = await Batch.findOne({ batchId });
  if (!batch) return err("Batch not found", 404);

  // Recalculate compliance from all readings in this batch
  const existingReadings = await SensorData.find({ batchId }).lean();
  const allReadings = [
    ...existingReadings,
    { ...readings, farmId, batchId, timestamp: timestamp ? new Date(timestamp) : new Date() },
  ];

  const report = calculateComplianceScore(
    allReadings.map((r) => ({ ...r, timestamp: new Date((r as { timestamp: Date | string }).timestamp) }))
  );

  const doc = await SensorData.create({
    farmId,
    batchId,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    ...readings,
    complianceScore: report.complianceScore,
    grade: report.grade,
  });

  await Batch.findOneAndUpdate(
    { batchId },
    { overallScore: report.complianceScore, overallGrade: report.grade, dataPoints: allReadings.length }
  );

  await writeAuditLog(userId, "sensor_data_submitted", "sensor_data", ip, {
    resourceId: doc._id.toString(),
    details: { batchId, farmId, score: report.complianceScore, grade: report.grade },
  });

  return ok({
    id: doc._id,
    score: report.complianceScore,
    grade: report.grade,
    message: `Reading recorded. Batch compliance: ${report.grade} (${report.complianceScore}/100)`,
  }, 201);
}
