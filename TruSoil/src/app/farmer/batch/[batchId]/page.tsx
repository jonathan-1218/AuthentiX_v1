"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { Grade } from "@/types";

interface BatchData {
  batch: { batchId: string; batchName: string; overallScore: number; overallGrade: Grade; approvalStatus: string; status: string; qrCode?: string; blockchainAddress?: string; dataPoints: number; createdAt: string };
  sensorData: { timestamp: string; temperature: number; humidity: number; soilMoisture: number; pH: number; pesticide: number }[];
}

export default function FarmerBatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [data, setData] = useState<BatchData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/batch/${batchId}`)
      .then((r) => r.json())
      .then((d) => setData(d.data ?? null));
  }, [batchId]);

  async function submitForCertification() {
    setSubmitting(true);
    await fetch(`/api/certification/submit/${batchId}`, { method: "POST" });
    setSubmitted(true);
    setSubmitting(false);
  }

  if (!data) return (
    <DashboardLayout role="farmer">
      <div className="text-muted text-sm">Loading batch…</div>
    </DashboardLayout>
  );

  const { batch, sensorData } = data;

  return (
    <DashboardLayout role="farmer">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">{batch.batchName}</h1>
            <p className="text-muted text-sm mt-1 font-mono">{batch.batchId}</p>
          </div>
          <GradeBadge grade={batch.overallGrade} size="lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="panel flex flex-col items-center justify-center py-8">
            <ScoreRing score={batch.overallScore} grade={batch.overallGrade} />
            <p className="text-xs text-muted mt-3">Compliance Score</p>
          </div>

          <div className="md:col-span-2 panel space-y-4">
            <h3 className="font-semibold">Batch details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Status", batch.status],
                ["Approval", batch.approvalStatus],
                ["Data points", String(batch.dataPoints)],
                ["Created", format(new Date(batch.createdAt), "dd MMM yyyy")],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted">{k}</p>
                  <p className="font-medium text-foreground mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            {batch.blockchainAddress && (
              <div className="flex items-center gap-2 text-xs text-accent-teal">
                <CheckCircle size={14} />
                <span className="font-mono break-all">{batch.blockchainAddress}</span>
              </div>
            )}

            {batch.qrCode && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={batch.qrCode} alt="Certificate QR" className="w-24 h-24 rounded-xl" />
            )}

            {batch.status === "active" && !submitted && (
              <button onClick={submitForCertification} disabled={submitting} className="btn-primary mt-2">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : "Submit for certification"}
              </button>
            )}
            {submitted && (
              <div className="badge-green w-fit">
                <CheckCircle size={14} />
                Submitted for verification
              </div>
            )}
            {batch.approvalStatus === "rejected" && (
              <div className="flex items-center gap-2 text-accent-red text-sm">
                <XCircle size={14} />
                Certification rejected
              </div>
            )}
          </div>
        </div>

        {sensorData.length > 0 && (
          <div className="panel">
            <h3 className="font-semibold mb-5">30-day sensor history</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sensorData.slice(-720)} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }}
                    tickFormatter={(v) => format(new Date(v), "dd/MM")} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#0f1410", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                    labelFormatter={(v) => format(new Date(v), "dd MMM HH:mm")}
                  />
                  <Area type="monotone" dataKey="temperature" name="Temp °C" stroke="#06b6d4" fill="rgba(6,182,212,0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pesticide" name="Pesticide ppm" stroke="#f87171" fill="rgba(248,113,113,0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pH" name="pH" stroke="#4ade80" fill="rgba(74,222,128,0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
