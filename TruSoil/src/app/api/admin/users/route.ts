import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { ok, err } from "@/lib/api-response";
import { escapeRegex, parsePage } from "@/lib/validators";
import User from "@/models/User";

const PAGE_SIZE = 50;

const querySchema = z.object({
  role:   z.enum(["farmer", "government_officer", "admin"]).optional(),
  // Search term: max 100 chars to keep regex complexity bounded
  q:      z.string().max(100).optional(),
  page:   z.string().optional(),
}).strict();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const qParsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!qParsed.success) return err(qParsed.error.errors[0].message, 400);

  const { role, q: search } = qParsed.data;
  const page = parsePage(url.searchParams.get("page"));
  const skip = (page - 1) * PAGE_SIZE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (role) filter.role = role;
  if (search) {
    // Escape special regex characters to prevent ReDoS
    const safe = escapeRegex(search);
    filter.$or = [
      { email: { $regex: safe, $options: "i" } },
      { name:  { $regex: safe, $options: "i" } },
    ];
  }

  await connectDB();

  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    User.countDocuments(filter),
  ]);

  return ok({ users, page, total, pages: Math.ceil(total / PAGE_SIZE) });
}
