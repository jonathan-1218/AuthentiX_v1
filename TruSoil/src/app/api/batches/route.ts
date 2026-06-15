import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok } from "@/lib/api-response";
import Batch from "@/models/Batch";
import Farm from "@/models/Farm";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id")!;
  const role = req.headers.get("x-user-role")!;
  const url = new URL(req.url);

  const status = url.searchParams.get("status");
  const grade = url.searchParams.get("grade");
  const page = parseInt(url.searchParams.get("page") ?? "1");

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (role === "farmer") {
    const farms = await Farm.find({ farmerUserId: userId }).select("farmId").lean();
    filter.farmId = { $in: farms.map((f) => f.farmId) };
  }

  if (status) filter.status = status;
  if (grade) filter.overallGrade = grade;

  const skip = (page - 1) * PAGE_SIZE;
  const [batches, total] = await Promise.all([
    Batch.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    Batch.countDocuments(filter),
  ]);

  return ok({ batches, page, total, pages: Math.ceil(total / PAGE_SIZE) });
}
