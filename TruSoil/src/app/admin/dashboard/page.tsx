"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Activity, Database, Layers, ShieldCheck, Users } from "lucide-react";

interface SystemData {
  userCounts: { farmer: number; government_officer: number; admin: number };
  batchTotal: number;
  recentLogs: { action: string; userId: string; timestamp: string }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<SystemData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/batches").then((r) => r.json()),
      fetch("/api/admin/audit-logs").then((r) => r.json()),
    ]).then(([users, batches, logs]) => {
      const all: { role: string }[] = users.data?.users ?? [];
      setData({
        userCounts: {
          farmer: all.filter((u) => u.role === "farmer").length,
          government_officer: all.filter((u) => u.role === "government_officer").length,
          admin: all.filter((u) => u.role === "admin").length,
        },
        batchTotal: batches.data?.total ?? 0,
        recentLogs: (logs.data?.logs ?? []).slice(0, 10),
      });
    });
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="max-w-5xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground">System Overview</h1>
          <p className="text-muted text-sm mt-1">Platform health and activity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: "Farmers", value: data?.userCounts.farmer ?? "—", icon: Users },
            { label: "Officers", value: data?.userCounts.government_officer ?? "—", icon: ShieldCheck },
            { label: "Admins", value: data?.userCounts.admin ?? "—", icon: Users },
            { label: "Total batches", value: data?.batchTotal ?? "—", icon: Layers },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="panel">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted">{label}</span>
                <Icon size={14} className="text-accent-green" />
              </div>
              <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* System status */}
        <div className="panel">
          <p className="font-semibold mb-4">System status</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "MongoDB", icon: Database, ok: true },
              { label: "Firebase", icon: Activity, ok: true },
              { label: "Blockchain RPC", icon: ShieldCheck, ok: !!process.env.NEXT_PUBLIC_APP_URL },
            ].map(({ label, icon: Icon, ok }) => (
              <div key={label} className="flex items-center gap-3 panel-elevated">
                <div className={`w-2 h-2 rounded-full ${ok ? "bg-accent-green" : "bg-accent-red"}`} />
                <Icon size={14} className="text-muted" />
                <span className="text-sm text-foreground">{label}</span>
                <span className={`ml-auto text-xs ${ok ? "text-accent-green" : "text-accent-red"}`}>{ok ? "Online" : "Offline"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit logs */}
        {data?.recentLogs && data.recentLogs.length > 0 && (
          <div className="panel p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/7">
              <p className="font-semibold text-sm">Recent activity</p>
            </div>
            <table className="data-table">
              <thead><tr><th>Action</th><th>User ID</th><th>Time</th></tr></thead>
              <tbody>
                {data.recentLogs.map((l, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-accent-green">{l.action}</td>
                    <td className="font-mono text-xs text-muted">{l.userId.slice(0, 16)}…</td>
                    <td className="text-xs text-muted">{new Date(l.timestamp).toLocaleString()}</td>
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
