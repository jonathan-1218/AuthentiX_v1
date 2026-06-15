import { NextRequest } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return err("No refresh token", 401);

  try {
    const payload = verifyRefreshToken(refreshToken);
    const token = signAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    const response = ok({ token });
    response.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 3600 });
    return response;
  } catch {
    return err("Invalid or expired refresh token", 401);
  }
}
