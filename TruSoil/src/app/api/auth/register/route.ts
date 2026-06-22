import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { ok, err } from "@/lib/api-response";
import User from "@/models/User";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  name: z.string().trim().min(2).max(100),
  // 10-digit Indian mobile numbers starting with 6-9
  phone: z.string().regex(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian number"),
  role: z.enum(["farmer", "government_officer"]),
  farmName:               z.string().trim().min(1).max(150).optional(),
  governmentDepartment:   z.string().trim().min(1).max(150).optional(),
}).strict(); // reject unexpected fields

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  // Rate limit: 5 registrations per hour per IP — enforced in all environments
  const limit = rateLimit(`register:ip:${ip}`, LIMITS.REGISTER.max, LIMITS.REGISTER.windowMs);
  if (!limit.allowed) {
    const res = err("Too many registration attempts. Try again later.", 429);
    res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }

  let body: unknown;
  try { body = await req.json(); } catch { return err("Invalid JSON", 400); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors[0].message, 400);

  const { email, password, name, phone, role, farmName, governmentDepartment } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) return err("Email already registered", 409);

  const userId = `user_${crypto.randomUUID()}`;

  const user = await User.create({
    userId,
    email,
    password,
    name,
    phone,
    role,
    farmId: role === "farmer" && farmName ? `farm_${crypto.randomUUID()}` : undefined,
    governmentDepartment: role === "government_officer" ? governmentDepartment : undefined,
    isActive: true,
    profileComplete: false,
  });

  const payload      = { userId: user.userId, email: user.email, role: user.role };
  const token        = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await writeAuditLog(userId, "register", "user", ip, { details: { email, role } });

  const isProd = process.env.NODE_ENV === "production";
  const response = ok({ userId: user.userId, email: user.email, role: user.role, token, refreshToken }, 201);
  response.cookies.set("token",        token,        { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 3600 });
  response.cookies.set("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
