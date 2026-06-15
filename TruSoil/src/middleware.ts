import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "fallback");

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
];

const ROLE_PREFIXES: Record<string, string[]> = {
  "/farmer": ["farmer"],
  "/government": ["government_officer"],
  "/admin": ["admin"],
  "/api/government": ["government_officer", "admin"],
  "/api/admin": ["admin"],
};

function isPublic(pathname: string): boolean {
  if (pathname.startsWith("/verify/") || pathname.startsWith("/api/blockchain/verify/") || pathname.startsWith("/api/qr/")) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function getAllowedRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix)) return roles;
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    const role = payload.role as string;
    const userId = payload.userId as string;
    const email = payload.email as string;

    const allowedRoles = getAllowedRoles(pathname);
    if (allowedRoles && !allowedRoles.includes(role)) {
      if (pathname.startsWith("/api/")) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", userId);
    headers.set("x-user-role", role);
    headers.set("x-user-email", email);

    return NextResponse.next({ request: { headers } });
  } catch {
    if (pathname.startsWith("/api/")) return NextResponse.json({ success: false, error: "Token expired" }, { status: 401 });
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
