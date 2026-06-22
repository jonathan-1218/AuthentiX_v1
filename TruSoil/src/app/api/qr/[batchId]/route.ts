import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { connectDB } from "@/lib/mongodb";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { batchIdSchema } from "@/lib/validators";
import Batch from "@/models/Batch";

export async function GET(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  // Public endpoint — image generation is CPU-expensive, so limit aggressively
  const limit = rateLimit(`qr:ip:${ip}`, LIMITS.QR.max, LIMITS.QR.windowMs);
  if (!limit.allowed) {
    return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": String(limit.retryAfter) },
    });
  }

  // Validate batchId format before touching the database
  const parsed = batchIdSchema.safeParse(params.batchId);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: "Invalid batchId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await connectDB();

  const batch = await Batch.findOne({ batchId: parsed.data }).lean();
  if (!batch) {
    return new NextResponse(JSON.stringify({ error: "Batch not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify/${parsed.data}`;

  const buffer = await QRCode.toBuffer(verifyUrl, { type: "png", width: 400, margin: 2 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
