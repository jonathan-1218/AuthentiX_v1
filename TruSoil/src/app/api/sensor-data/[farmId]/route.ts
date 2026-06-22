import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import { farmIdSchema, parsePage } from "@/lib/validators";
import SensorData from "@/models/SensorData";

const PAGE_SIZE = 100;

export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  const role = req.headers.get("x-user-role")!;

  // Validate farmId format before touching the database
  const idParsed = farmIdSchema.safeParse(params.farmId);
  if (!idParsed.success) return err("Invalid farmId", 400);
  const farmId = idParsed.data;

  // Farmers can only access their own farm's data
  if (role === "farmer") {
    const userFarmId = req.headers.get("x-farm-id");
    if (userFarmId && userFarmId !== farmId) return err("Forbidden", 403);
  }

  const page = parsePage(new URL(req.url).searchParams.get("page"));
  const skip = (page - 1) * PAGE_SIZE;

  await connectDB();

  const [data, total] = await Promise.all([
    SensorData.find({ farmId }).sort({ timestamp: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    SensorData.countDocuments({ farmId }),
  ]);

  const stats =
    data.length > 0
      ? {
          avgTemperature: +(data.reduce((a, d) => a + d.temperature, 0) / data.length).toFixed(2),
          avgHumidity: +(data.reduce((a, d) => a + d.humidity, 0) / data.length).toFixed(2),
          avgPH: +(data.reduce((a, d) => a + d.pH, 0) / data.length).toFixed(2),
          maxPesticide: Math.max(...data.map((d) => d.pesticide)),
          latestScore: data[0]?.complianceScore ?? 0,
          latestGrade: data[0]?.grade ?? "C",
        }
      : null;

  return ok({ sensorData: data, stats, page, total, pages: Math.ceil(total / PAGE_SIZE) });
}
