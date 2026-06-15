"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { AlertTriangle, CheckCircle, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { Grade } from "@/types";

interface Batch { batchId: string; batchName: string; overallScore: number; overallGrade: Grade; dataPoints: number; farmId: string }
interface SensorRow { timestamp: string; temperature: number; humidity: number; soilMoisture: number; pH: number; pesticide: number; rain: number }
interface VerifyResult { verified: boolean; calculatedRoot: string; blockchainRoot: string; match: boolean }

export default function GovVerificationPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const router = useRouter();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [comment, setComment] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    fetch(`/api/batch/${batchId}`)
      .then((r) => r.json())
      .then((d) => {
        setBatch(d.data?.batch ?? null);
        setRows(d.data?.sensorData ?? []);
      });
  }, [batchId]);

  async function runVerify() {
    setVerifying(true);
    const res = await fetch(`/api/government/verify/${batchId}`, { method: "POST" });
    const data = await res.json();
    setVerifyResult(data.data ?? null);
    setVerifying(false);
  }

  async function approve() {
    setApproving(true);
    await fetch(`/api/government/approve/${batchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    setDone("approved");
    setApproving(false);
    setTimeout(() => router.push("/government/approved"), 2000);
  }

  async function reject() {
    if (!rejectReason) return;
    setRejecting(true);
    await fetch(`/api/government/reject/${batchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    });
    setDone("rejected");
    setRejecting(false);
    setTimeout(() => router.push("/government/dashboard"), 2000);
  }

  if (!batch) return <DashboardLayout role="government_officer"><p className="text-muted text-sm">Loading…</p></DashboardLayout>;

  return (
    <DashboardLayout role="government_officer">
      <div className="max-w-6xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">{batch.batchName}</h1>
            <p className="text-xs text-muted font-mono mt-1">{batchId}</p>
          </div>
          <GradeBadge grade={batch.overallGrade} size="lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sensor table */}
          <div className="lg:col-span-2 panel p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/7">
              <p className="font-semibold text-sm">Sensor readings ({rows.length} records)</p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th><th>Temp</th><th>Hum</th><th>Moisture</th><th>pH</th><th>Pesticide</th><th>Rain</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((r, i) => (
                    <tr key={i}>
                      <td className="text-xs text-muted">{format(new Date(r.timestamp), "dd/MM HH:mm")}</td>
                      <td className="font-mono">{r.temperature}°C</td>
                      <td className="font-mono">{r.humidity}%</td>
                      <td className="font-mono">{r.soilMoisture}%</td>
                      <td className={`font-mono ${r.pH < 6 || r.pH > 7 ? "text-accent-amber" : ""}`}>{r.pH}</td>
                      <td className={`font-mono ${r.pesticide > 5 ? "text-accent-red" : r.pesticide > 0.5 ? "text-accent-amber" : "text-accent-green"}`}>{r.pesticide}</td>
                      <td className="font-mono text-muted">{r.rain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification panel */}
          <div className="space-y-4">
            <div className="panel flex flex-col items-center py-6">
              <ScoreRing score={batch.overallScore} grade={batch.overallGrade} />
              <p className="text-xs text-muted mt-3">Compliance Score</p>
            </div>

            <div className="panel space-y-4">
              <p className="font-semibold text-sm">Blockchain verification</p>

              {!verifyResult && (
                <button onClick={runVerify} disabled={verifying} className="btn-primary w-full justify-center">
                  {verifying ? <Loader2 size={14} className="animate-spin" /> : <><ShieldCheck size={14} /> Verify on blockchain</>}
                </button>
              )}

              {verifyResult && (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm font-semibold ${verifyResult.verified ? "text-accent-green" : "text-accent-red"}`}>
                    {verifyResult.verified ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {verifyResult.verified ? "Data verified — intact" : "ALERT: Data tampered"}
                  </div>
                  <div className="text-xs text-muted space-y-1 font-mono break-all">
                    <p>Calculated: {verifyResult.calculatedRoot.slice(0, 16)}…</p>
                    <p>On-chain: {verifyResult.blockchainRoot.slice(0, 16)}…</p>
                    <p className={verifyResult.match ? "text-accent-green" : "text-accent-red"}>
                      {verifyResult.match ? "✓ Match" : "✗ Mismatch"}
                    </p>
                  </div>
                </div>
              )}

              {verifyResult?.verified && !done && (
                <div className="space-y-3 pt-2 border-t border-white/7">
                  <div>
                    <label className="label">Comment (optional)</label>
                    <input className="input" placeholder="Notes for the farmer…" value={comment} onChange={(e) => setComment(e.target.value)} />
                  </div>
                  <button onClick={approve} disabled={approving} className="btn-primary w-full justify-center">
                    {approving ? <Loader2 size={14} className="animate-spin" /> : "Approve & certify"}
                  </button>
                  <div>
                    <label className="label">Rejection reason</label>
                    <input className="input" placeholder="Required to reject…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                  </div>
                  <button onClick={reject} disabled={rejecting || !rejectReason} className="btn-danger w-full justify-center">
                    {rejecting ? <Loader2 size={14} className="animate-spin" /> : "Reject"}
                  </button>
                </div>
              )}

              {verifyResult && !verifyResult.verified && (
                <div className="flex items-center gap-2 text-accent-amber text-xs">
                  <AlertTriangle size={14} />
                  Approval blocked — data integrity check failed
                </div>
              )}

              {done && (
                <div className={`badge-${done === "approved" ? "green" : "red"} w-fit`}>
                  {done === "approved" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Batch {done}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
