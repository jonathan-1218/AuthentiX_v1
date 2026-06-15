import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TruSoil — Organic Certification on Blockchain",
  description:
    "IoT-backed, blockchain-anchored organic certification for Tamil Nadu. Real-time sensor data, Merkle-root verified, NPOP-aligned grading.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
