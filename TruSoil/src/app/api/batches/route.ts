import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import { parsePage } from "@/lib/validators";
import Batch from "@/models/Batch";
import Farm from "@/models/Farm";

const PAGE_SIZE = 20;

const querySchema = z.object({
  status: z.enum(["active", "completed", "certified", "rejected"]).optional(),
  grade:  z.enum(["A+", "A", "B", "C"]).optional(),
  page:   z.string().optional(),
}).strict();

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id")!;
  const role   = req.headers.get("x-user-role")!;
  const url    = new URL(req.url);

  const qParsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!qParsed.success) return err(qParsed.error.errors[0].message, 400);

  const { status, grade } = qParsed.data;
  const page = parsePage(url.searchParams.get("page"));
  const skip = (page - 1) * PAGE_SIZE;

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (role === "farmer") {
    const farms = await Farm.find({ farmerUserId: userId }).select("farmId").lean();
    filter.farmId = { $in: farms.map((f) => f.farmId) };
  }

  if (status) filter.status = status;
  if (grade)  filter.overallGrade = grade;

  const [batches, total] = await Promise.all([
    Batch.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    Batch.countDocuments(filter),
  ]);

  return ok({ batches, page, total, pages: Math.ceil(total / PAGE_SIZE) });
}
