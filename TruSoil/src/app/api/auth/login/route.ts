import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { ok, err } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";
import User from "@/models/User";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (process.env.NODE_ENV === "production") {
    const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) return err("Too many login attempts. Try again in 15 minutes.", 429);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid credentials", 400);

  const { email, password } = parsed.data;

  await connectDB();

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive) return err("Invalid credentials", 401);

  const valid = await user.comparePassword(password);
  if (!valid) return err("Invalid credentials", 401);

  user.lastLogin = new Date();
  await user.save();

  const payload = { userId: user.userId, email: user.email, role: user.role };
  const token = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await writeAuditLog(user.userId, "login", "user", ip);

  const isProd = process.env.NODE_ENV === "production";
  const response = ok({ userId: user.userId, email: user.email, role: user.role, token, refreshToken });
  response.cookies.set("token", token, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 3600 });
  response.cookies.set("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
