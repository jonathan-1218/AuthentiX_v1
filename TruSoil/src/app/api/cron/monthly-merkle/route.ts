import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { storeMonthlyRootOnChain } from "@/lib/blockchain";
import { buildMonthlyMerkleRoot } from "@/lib/merkle";
import DailyMerkleRoot from "@/models/DailyMerkleRoot";

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("authorization");
  if (!cronSecret || cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized: Invalid CRON_SECRET" }, { status: 401 });
  }

  try {
    await connectDB();

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1; // 1-12
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    const dailyRoots = await DailyMerkleRoot.find({
      date: { $gte: `${monthKey}-01`, $lte: `${monthKey}-31` },
    }).sort({ date: 1 });

    if (dailyRoots.length === 0) {
      return NextResponse.json({ message: "No daily roots found for last month", monthKey });
    }

    const merkleRootArray = dailyRoots.map((r) => r.merkleRoot);
    const monthlyMerkleRoot = buildMonthlyMerkleRoot(merkleRootArray);
    const farmCount = new Set(dailyRoots.map((r) => r.farmId)).size;

    const result = await storeMonthlyRootOnChain({
      monthKey,
      merkleRoot: monthlyMerkleRoot,
      year,
      month,
      farmCount,
      dailyRootCount: dailyRoots.length,
    });

    return NextResponse.json({
      monthKey,
      merkleRoot: monthlyMerkleRoot,
      txHash: result.transactionHash,
      gasUsed: result.gasUsed,
      blockNumber: result.blockNumber,
      dailyRootCount: dailyRoots.length,
      farmCount,
    });
  } catch (error) {
    console.error("Monthly merkle cron error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
