import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ok } from "@/lib/api-response";
import AuditLog from "@/models/AuditLog";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const action = url.searchParams.get("action");
  const date = url.searchParams.get("date");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const skip = (page - 1) * PAGE_SIZE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.timestamp = { $gte: start, $lt: end };
  }

  await connectDB();

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    AuditLog.countDocuments(filter),
  ]);

  return ok({ logs, page, total, pages: Math.ceil(total / PAGE_SIZE) });
}
