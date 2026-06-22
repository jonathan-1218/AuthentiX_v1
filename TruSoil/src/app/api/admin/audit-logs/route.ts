import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import { parsePage, parseDate } from "@/lib/validators";
import AuditLog from "@/models/AuditLog";

const PAGE_SIZE = 50;

const querySchema = z.object({
  userId: z.string().max(60).optional(),
  action: z.string().max(60).optional(),
  // Date must be YYYY-MM-DD — validated by parseDate, not fed raw to new Date()
  date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page:   z.string().optional(),
}).strict();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const qParsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!qParsed.success) return err(qParsed.error.errors[0].message, 400);

  const { userId, action, date: dateStr } = qParsed.data;
  const page = parsePage(url.searchParams.get("page"));
  const skip = (page - 1) * PAGE_SIZE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action;
  if (dateStr) {
    const start = parseDate(dateStr);
    // parseDate returns null when the string produces an invalid date
    if (!start) return err("Invalid date format — use YYYY-MM-DD", 400);
    const end = new Date(start);
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
