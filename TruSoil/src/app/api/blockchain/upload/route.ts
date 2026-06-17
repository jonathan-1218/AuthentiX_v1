import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { storeMonthlyRootOnChain } from "@/lib/blockchain";
import { buildMonthlyMerkleRoot } from "@/lib/merkle";
import { ok, err } from "@/lib/api-response";
import DailyMerkleRoot from "@/models/DailyMerkleRoot";

const schema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/, "monthKey must be YYYY-MM"),
});

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role")!;
  if (role !== "admin" && role !== "government_officer") return err("Forbidden", 403);

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  const { monthKey } = parsed.data;
  const [yearStr, monthStr] = monthKey.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  await connectDB();

  const dailyRoots = await DailyMerkleRoot.find({
    date: { $gte: `${monthKey}-01`, $lte: `${monthKey}-31` },
  }).sort({ date: 1 });

  if (dailyRoots.length === 0) return err("No daily roots found for this month", 400);

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

  return ok({
    monthKey,
    merkleRoot: monthlyMerkleRoot,
    transactionHash: result.transactionHash,
    blockNumber: result.blockNumber,
    gasUsed: result.gasUsed,
    farmCount,
    dailyRootCount: dailyRoots.length,
  });
}
