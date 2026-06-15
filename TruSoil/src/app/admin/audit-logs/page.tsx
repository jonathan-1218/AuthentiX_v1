"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { format } from "date-fns";

interface Log { action: string; userId: string; resource: string; resourceId?: string; ipAddress: string; timestamp: string }

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (filterAction) params.set("action", filterAction);
    if (filterDate) params.set("date", filterDate);
    fetch(`/api/admin/audit-logs?${params}`)
      .then((r) => r.json())
      .then((d) => { setLogs(d.data?.logs ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Audit Logs</h1>
          <p className="text-muted text-sm mt-1">Complete system action trail</p>
        </div>

        <div className="flex gap-3">
          <input className="input max-w-[200px]" placeholder="Filter by action…" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} />
          <input type="date" className="input max-w-[180px]" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          <button onClick={load} className="btn-ghost">Apply</button>
        </div>

        {loading ? <p className="text-muted text-sm">Loading logs…</p> : (
          <div className="panel p-0 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr><th>Action</th><th>User</th><th>Resource</th><th>IP</th><th>Time</th></tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td><span className="font-mono text-xs text-accent-green">{l.action}</span></td>
                    <td className="font-mono text-xs text-muted">{l.userId.slice(0, 14)}…</td>
                    <td className="text-xs text-muted">{l.resource}{l.resourceId ? ` / ${l.resourceId.slice(0, 10)}…` : ""}</td>
                    <td className="font-mono text-xs text-muted">{l.ipAddress}</td>
                    <td className="text-xs text-muted">{format(new Date(l.timestamp), "dd MMM HH:mm:ss")}</td>
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
