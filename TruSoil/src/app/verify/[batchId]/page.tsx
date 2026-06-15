import { CheckCircle, Leaf, XCircle } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { GradeBadge } from "@/components/ui/GradeBadge";
import type { Grade } from "@/types";

interface PageProps { params: { batchId: string } }

async function fetchVerification(batchId: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const [batchRes, blockchainRes] = await Promise.all([
      fetch(`${appUrl}/api/batch/${batchId}`, { cache: "no-store" }),
      fetch(`${appUrl}/api/blockchain/verify/${batchId}`, { cache: "no-store" }),
    ]);
    const batch = batchRes.ok ? await batchRes.json() : null;
    const blockchain = blockchainRes.ok ? await blockchainRes.json() : null;
    return { batch: batch?.data?.batch ?? null, blockchain: blockchain?.data ?? null };
  } catch {
    return { batch: null, blockchain: null };
  }
}

export default async function PublicVerifyPage({ params }: PageProps) {
  const { batch, blockchain } = await fetchVerification(params.batchId);

  if (!batch) {
    return (
      <>
        <AmbientBackground />
        <div className="min-h-screen flex items-center justify-center text-center px-6">
          <div className="panel max-w-md py-16">
            <XCircle size={40} className="text-accent-red mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-foreground mb-2">Certificate not found</h1>
            <p className="text-muted text-sm">This batch ID does not exist or has not been certified yet.</p>
          </div>
        </div>
      </>
    );
  }

  const verified = blockchain?.verified ?? false;
  const grade = (batch.overallGrade ?? "C") as Grade;

  return (
    <>
      <AmbientBackground />
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-5">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-3">
              <Leaf size={18} className="text-accent-green" />
              <span className="font-serif text-xl">TruSoil</span>
            </div>
            <p className="text-xs text-muted">Public Certificate Verification</p>
          </div>

          {/* Main cert card */}
          <div className="panel text-center py-10">
            <div className="mb-6">
              <GradeBadge grade={grade} size="lg" />
            </div>
            <h1 className="font-serif text-3xl text-foreground mb-1">{batch.batchName}</h1>
            <p className="text-muted text-sm">Farm ID: {batch.farmId}</p>
            <p className="text-muted text-xs mt-1 font-mono">Batch: {params.batchId}</p>
          </div>

          {/* Blockchain status */}
          <div className={`panel flex items-center gap-4 ${verified ? "border-accent-green/20" : "border-accent-red/20"}`}>
            {verified ? (
              <CheckCircle size={24} className="text-accent-green shrink-0" />
            ) : (
              <XCircle size={24} className="text-accent-red shrink-0" />
            )}
            <div>
              <p className={`font-semibold text-sm ${verified ? "text-accent-green" : "text-accent-red"}`}>
                {verified ? "Blockchain Verified" : "Verification Unavailable"}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {verified
                  ? "Sensor data Merkle root matches on-chain record. Data is intact."
                  : "Could not verify against blockchain. Certificate may be pending upload."}
              </p>
              {blockchain?.blockchainData?.transactionHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${blockchain.blockchainData.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-teal hover:underline font-mono mt-1 block break-all"
                >
                  {blockchain.blockchainData.transactionHash}
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Compliance score", value: `${batch.overallScore}/100` },
              { label: "Data points", value: batch.dataPoints },
              { label: "Status", value: batch.status },
            ].map(({ label, value }) => (
              <div key={label} className="panel text-center">
                <p className="text-xl font-mono font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* QR */}
          {batch.qrCode && (
            <div className="panel flex flex-col items-center py-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={batch.qrCode} alt="Certificate QR code" className="w-32 h-32 rounded-xl" />
              <p className="text-xs text-muted mt-3">Scan to share this certificate</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
