"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { format } from "date-fns";
import type { Grade } from "@/types";

interface Batch {
  batchId: string;
  batchName: string;
  farmId: string;
  overallScore: number;
  overallGrade: Grade;
  dataPoints: number;
  createdAt: string;
}

export default function GovDashboardPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/government/pending")
      .then((r) => r.json())
      .then((d) => { setBatches(d.data?.batches ?? []); setLoading(false); });
  }, []);

  return (
    <DashboardLayout role="government_officer">
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Verification Queue</h1>
          <p className="text-muted text-sm mt-1">{batches.length} batch{batches.length !== 1 ? "es" : ""} pending review</p>
        </div>

        {loading ? (
          <p className="text-muted text-sm">Loading queue…</p>
        ) : batches.length === 0 ? (
          <div className="panel text-center py-12 text-muted">No batches pending verification.</div>
        ) : (
          <div className="panel p-0 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch name</th>
                  <th>Farm ID</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Data points</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.batchId}>
                    <td className="font-medium text-foreground">{b.batchName}</td>
                    <td className="font-mono text-xs text-muted">{b.farmId}</td>
                    <td className="font-mono">{b.overallScore}</td>
                    <td><GradeBadge grade={b.overallGrade} /></td>
                    <td className="font-mono text-muted">{b.dataPoints}</td>
                    <td className="text-muted text-xs">{format(new Date(b.createdAt), "dd MMM yyyy")}</td>
                    <td>
                      <Link href={`/government/verification/${b.batchId}`} className="btn-primary py-1.5 px-3 text-xs">
                        Review
                      </Link>
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
