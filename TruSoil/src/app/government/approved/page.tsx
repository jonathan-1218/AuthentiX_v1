"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { format } from "date-fns";
import type { Grade } from "@/types";

interface Batch { batchId: string; batchName: string; overallScore: number; overallGrade: Grade; farmId: string; updatedAt: string; qrCode?: string }

export default function GovApprovedPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/batches?status=certified")
      .then((r) => r.json())
      .then((d) => { setBatches(d.data?.batches ?? []); setLoading(false); });
  }, []);

  return (
    <DashboardLayout role="government_officer">
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Approved Certificates</h1>
          <p className="text-muted text-sm mt-1">{batches.length} certified batch{batches.length !== 1 ? "es" : ""}</p>
        </div>

        {loading ? <p className="text-muted text-sm">Loading…</p> : (
          <div className="panel p-0 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr><th>Batch</th><th>Farm ID</th><th>Score</th><th>Grade</th><th>Approved</th><th>QR</th></tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.batchId}>
                    <td className="font-medium text-foreground">{b.batchName}</td>
                    <td className="font-mono text-xs text-muted">{b.farmId}</td>
                    <td className="font-mono">{b.overallScore}</td>
                    <td><GradeBadge grade={b.overallGrade} /></td>
                    <td className="text-muted text-xs">{format(new Date(b.updatedAt), "dd MMM yyyy")}</td>
                    <td>
                      {b.qrCode
                        ? <a href={`/api/qr/${b.batchId}`} target="_blank" className="text-accent-green text-xs hover:underline">Download QR</a>
                        : <span className="text-muted text-xs">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
