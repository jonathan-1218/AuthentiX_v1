import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { ok, err } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";
import User from "@/models/User";

// .strict() rejects any fields not listed here (attacker cannot inject extra props)
const schema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(1).max(128),
}).strict();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  // Rate limit: 10 attempts per 15 min per IP — enforced in all environments
  const limit = rateLimit(`login:ip:${ip}`, LIMITS.LOGIN.max, LIMITS.LOGIN.windowMs);
  if (!limit.allowed) {
    const res = err("Too many login attempts. Try again later.", 429);
    res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  // Return generic message — don't leak which field failed (email enumeration)
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
  const token        = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await writeAuditLog(user.userId, "login", "user", ip);

  const isProd = process.env.NODE_ENV === "production";
  const response = ok({ userId: user.userId, email: user.email, role: user.role, token, refreshToken });
  response.cookies.set("token",        token,        { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 3600 });
  response.cookies.set("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
