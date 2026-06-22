import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/audit";
import { ok, err } from "@/lib/api-response";
import { userIdSchema } from "@/lib/validators";
import User from "@/models/User";

const schema = z.object({ isActive: z.boolean() }).strict();

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const actingUserId = req.headers.get("x-user-id")!;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  // Validate userId path param format
  const idParsed = userIdSchema.safeParse(params.userId);
  if (!idParsed.success) return err("Invalid userId", 400);

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  await connectDB();

  const user = await User.findOneAndUpdate(
    { userId: idParsed.data },
    { isActive: parsed.data.isActive },
    { new: true }
  ).select("-password");

  if (!user) return err("User not found", 404);

  await writeAuditLog(actingUserId, parsed.data.isActive ? "user_activated" : "user_deactivated", "user", ip, {
    resourceId: idParsed.data,
  });

  return ok({ success: true, user });
}
