import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import User from "@/models/User";

const schema = z.object({ isActive: z.boolean() });

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const actingUserId = req.headers.get("x-user-id")!;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  await connectDB();

  const user = await User.findOneAndUpdate(
    { userId: params.userId },
    { isActive: parsed.data.isActive },
    { new: true }
  ).select("-password");

  if (!user) return err("User not found", 404);

  await writeAuditLog(actingUserId, parsed.data.isActive ? "user_activated" : "user_deactivated", "user", ip, {
    resourceId: params.userId,
  });

  return ok({ success: true, user });
}
