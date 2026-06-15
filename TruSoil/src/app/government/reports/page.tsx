"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Stats { total: number; certified: number; rejected: number; pending: number; avgScore: number }

const COLORS: Record<string, string> = { "A+": "#4ade80", A: "#86efac", B: "#fbbf24", C: "#f87171" };

export default function GovReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [gradeData, setGradeData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/batches").then((r) => r.json()),
      fetch("/api/batches?status=certified").then((r) => r.json()),
      fetch("/api/batches?approvalStatus=rejected").then((r) => r.json()),
    ]).then(([all, certified, rejected]) => {
      const certBatches: { overallGrade: string; overallScore: number }[] = certified.data?.batches ?? [];

      const avg = certBatches.length
        ? certBatches.reduce((a: number, b: { overallScore: number }) => a + b.overallScore, 0) / certBatches.length
        : 0;

      setStats({
        total: all.data?.total ?? 0,
        certified: certified.data?.total ?? 0,
        rejected: rejected.data?.total ?? 0,
        pending: (all.data?.total ?? 0) - (certified.data?.total ?? 0) - (rejected.data?.total ?? 0),
        avgScore: Math.round(avg),
      });

      const gradeCounts: Record<string, number> = {};
      for (const b of certBatches) {
        gradeCounts[b.overallGrade] = (gradeCounts[b.overallGrade] ?? 0) + 1;
      }
      setGradeData(Object.entries(gradeCounts).map(([name, value]) => ({ name, value })));
    });
  }, []);

  return (
    <DashboardLayout role="government_officer">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Reports</h1>
          <p className="text-muted text-sm mt-1">30-day verification analytics</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Total batches", value: stats.total },
              { label: "Certified", value: stats.certified },
              { label: "Rejected", value: stats.rejected },
              { label: "Avg score", value: `${stats.avgScore}/100` },
            ].map(({ label, value }) => (
              <div key={label} className="panel">
                <p className="text-xs text-muted mb-2">{label}</p>
                <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}

        {gradeData.length > 0 && (
          <div className="panel">
            <p className="font-semibold mb-5">Grade distribution (certified batches)</p>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {gradeData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name] ?? "#94a3b8"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f1410", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
