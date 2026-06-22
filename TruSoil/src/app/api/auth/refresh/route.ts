import { NextRequest } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { ok, err } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  // Prevent token-refresh flooding — 20 per 15 min per IP
  const limit = rateLimit(`refresh:ip:${ip}`, LIMITS.REFRESH.max, LIMITS.REFRESH.windowMs);
  if (!limit.allowed) {
    const res = err("Too many refresh attempts. Try again later.", 429);
    res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }

  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return err("No refresh token", 401);

  try {
    const payload = verifyRefreshToken(refreshToken);
    const token = signAccessToken({
      userId: payload.userId,
      email:  payload.email,
      role:   payload.role,
    });

    // secure flag must match the same env-based logic as login/register
    const isProd = process.env.NODE_ENV === "production";
    const response = ok({ token });
    response.cookies.set("token", token, { httpOnly: true, secure: isProd, sameSite: "strict", maxAge: 3600 });
    return response;
  } catch {
    return err("Invalid or expired refresh token", 401);
  }
}
