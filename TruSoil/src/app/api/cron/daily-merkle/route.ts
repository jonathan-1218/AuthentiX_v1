import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SensorData from "@/models/SensorData";
import DailyMerkleRoot from "@/models/DailyMerkleRoot";
import { buildDailyMerkleRoot } from "@/lib/merkle";

export async function POST(request: NextRequest) {
  // Verify CRON_SECRET
  const cronSecret = request.headers.get("authorization");
  if (
    !cronSecret ||
    cronSecret !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid CRON_SECRET" },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    // Calculate yesterday's date as YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = yesterday.toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Query all sensor readings from yesterday
    const startOfDay = new Date(yesterday);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);

    const readings = await SensorData.find({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    // Group readings by farmId
    const readingsByFarm: Record<string, typeof readings> = {};
    for (const reading of readings) {
      if (!readingsByFarm[reading.farmId]) readingsByFarm[reading.farmId] = [];
      readingsByFarm[reading.farmId].push(reading);
    }

    // Build daily Merkle root for each farm and upsert
    const results = [];
    for (const [farmId, farmReadings] of Object.entries(readingsByFarm)) {
      const merkleRoot = buildDailyMerkleRoot(farmReadings);

      await DailyMerkleRoot.updateOne(
        { farmId, date: dateStr },
        {
          $set: {
            farmId,
            date: dateStr,
            merkleRoot,
            readingCount: farmReadings.length,
          },
        },
        { upsert: true }
      );

      results.push({
        farmId,
        merkleRoot,
        readingCount: farmReadings.length,
      });
    }

    return NextResponse.json({
      date: dateStr,
      farmsProcessed: results.length,
      roots: results,
    });
  } catch (error) {
    console.error("Daily merkle cron error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
