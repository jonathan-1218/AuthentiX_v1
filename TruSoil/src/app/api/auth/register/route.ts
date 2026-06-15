import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { ok, err } from "@/lib/api-response";
import User from "@/models/User";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian number"),
  role: z.enum(["farmer", "government_officer"]),
  farmName: z.string().optional(),
  governmentDepartment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (process.env.NODE_ENV === "production") {
    const limit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) return err("Too many registration attempts. Try again later.", 429);
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

  const payload = { userId: user.userId, email: user.email, role: user.role };
  const token = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await writeAuditLog(userId, "register", "user", ip, { details: { email, role } });

  const isProd = process.env.NODE_ENV === "production";
  const response = ok({ userId: user.userId, email: user.email, role: user.role, token, refreshToken }, 201);
  response.cookies.set("token", token, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 3600 });
  response.cookies.set("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
