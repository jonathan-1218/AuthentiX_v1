import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import { verifyMonthlyRoot } from "@/lib/blockchain";
import { buildMonthlyMerkleRoot } from "@/lib/merkle";
import DailyMerkleRoot from "@/models/DailyMerkleRoot";
import MonthlyBlockchainRecord from "@/models/MonthlyBlockchainRecord";

// Route parameter is kept as [batchId] for URL compatibility but is used as monthKey
export async function GET(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  await connectDB();

  // Support both ?monthKey=YYYY-MM and the path param
  const monthKey =
    req.nextUrl.searchParams.get("monthKey") || params.batchId;

  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return err("Provide a valid monthKey in YYYY-MM format", 400);
  }

  const [onChain, dbRecord] = await Promise.all([
    verifyMonthlyRoot(monthKey),
    MonthlyBlockchainRecord.findOne({ monthKey }).lean(),
  ]);

  if (!onChain) return err("Monthly root not found on blockchain", 404);

  const dailyRoots = await DailyMerkleRoot.find({
    date: { $gte: `${monthKey}-01`, $lte: `${monthKey}-31` },
  }).sort({ date: 1 });

  const calculatedRoot = buildMonthlyMerkleRoot(dailyRoots.map((r) => r.merkleRoot));
  const match = calculatedRoot === onChain.merkleRoot;

  return ok({
    verified: match,
    monthKey,
    blockchainData: onChain,
    dbRecord,
    calculatedRoot,
    dailyRootCount: dailyRoots.length,
    farmCount: onChain.farmCount,
    matchStatus: match ? "DATA_INTACT" : "DATA_TAMPERED",
  });
}
