import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import { farmIdSchema } from "@/lib/validators";
import SensorData from "@/models/SensorData";
import { subDays, format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  // Validate farmId format before touching the database
  const idParsed = farmIdSchema.safeParse(params.farmId);
  if (!idParsed.success) return err("Invalid farmId", 400);
  const farmId = idParsed.data;
  const since = subDays(new Date(), 30);

  await connectDB();

  const data = await SensorData.find({
    farmId,
    timestamp: { $gte: since },
  })
    .sort({ timestamp: 1 })
    .lean();

  // Group by day
  const grouped: Record<string, typeof data> = {};
  for (const d of data) {
    const day = format(new Date(d.timestamp), "yyyy-MM-dd");
    grouped[day] = grouped[day] ? [...grouped[day], d] : [d];
  }

  const daily = Object.entries(grouped).map(([date, readings]) => ({
    date,
    avgTemperature: +(readings.reduce((a, r) => a + r.temperature, 0) / readings.length).toFixed(2),
    avgHumidity: +(readings.reduce((a, r) => a + r.humidity, 0) / readings.length).toFixed(2),
    avgSoilMoisture: +(readings.reduce((a, r) => a + r.soilMoisture, 0) / readings.length).toFixed(2),
    avgPH: +(readings.reduce((a, r) => a + r.pH, 0) / readings.length).toFixed(2),
    avgPesticide: +(readings.reduce((a, r) => a + r.pesticide, 0) / readings.length).toFixed(2),
    avgScore: +(readings.reduce((a, r) => a + r.complianceScore, 0) / readings.length).toFixed(2),
    grade: readings[readings.length - 1].grade,
    dataPoints: readings.length,
  }));

  return ok({ daily });
}
