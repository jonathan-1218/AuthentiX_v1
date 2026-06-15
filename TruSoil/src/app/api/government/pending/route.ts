import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok } from "@/lib/api-response";
import Batch from "@/models/Batch";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const skip = (page - 1) * PAGE_SIZE;

  await connectDB();

  const [batches, total] = await Promise.all([
    Batch.find({ approvalStatus: "pending", status: "harvested" })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Batch.countDocuments({ approvalStatus: "pending", status: "harvested" }),
  ]);

  return ok({ batches, page, total, pages: Math.ceil(total / PAGE_SIZE) });
}
