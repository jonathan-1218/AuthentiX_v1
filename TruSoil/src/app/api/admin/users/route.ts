import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok } from "@/lib/api-response";
import User from "@/models/User";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const search = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const skip = (page - 1) * PAGE_SIZE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { email: { $regex: search, $options: "i" } },
    { name: { $regex: search, $options: "i" } },
  ];

  await connectDB();

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    User.countDocuments(filter),
  ]);

  return ok({ users, page, total, pages: Math.ceil(total / PAGE_SIZE) });
}
