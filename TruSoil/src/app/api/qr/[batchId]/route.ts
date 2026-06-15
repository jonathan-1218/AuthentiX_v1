import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { connectDB } from "@/lib/mongodb";
import Batch from "@/models/Batch";

export async function GET(
  req: NextRequest,
  { params }: { params: { batchId: string } }
) {
  await connectDB();

  const batch = await Batch.findOne({ batchId: params.batchId }).lean();
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify/${params.batchId}`;

  const buffer = await QRCode.toBuffer(verifyUrl, { type: "png", width: 400, margin: 2 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
