"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import type { Grade } from "@/types";

interface Batch {
  batchId: string;
  batchName: string;
  farmId: string;
  status: string;
  overallScore: number;
  overallGrade: Grade;
  approvalStatus: string;
  dataPoints: number;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  active: "badge-green",
  harvested: "badge-teal",
  certified: "badge-green",
  rejected: "badge-red",
};

const approvalColor: Record<string, string> = {
  pending: "badge-amber",
  approved: "badge-green",
  rejected: "badge-red",
};

export default function FarmerBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [farmId, setFarmId] = useState("");

  useEffect(() => {
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => { setBatches(d.data?.batches ?? []); setLoading(false); });
  }, []);

  async function createBatch() {
    if (!newName || !farmId) return;
    setCreating(true);
    const res = await fetch("/api/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchName: newName, farmId }),
    });
    const data = await res.json();
    if (res.ok) {
      setBatches((b) => [data.data, ...b]);
      setShowCreate(false);
      setNewName("");
    }
    setCreating(false);
  }

  return (
    <DashboardLayout role="farmer">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Batches</h1>
            <p className="text-muted text-sm mt-1">Manage your certification batches</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} />
            New batch
          </button>
        </div>

        {showCreate && (
          <div className="panel space-y-4">
            <h3 className="font-semibold">Create new batch</h3>
            <div>
              <label className="label">Batch name</label>
              <input className="input" placeholder="e.g. Kharif 2025 - Rice" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="label">Farm ID</label>
              <input className="input" placeholder="farm_xxxx" value={farmId} onChange={(e) => setFarmId(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={createBatch} disabled={creating} className="btn-primary">
                {creating ? <Loader2 size={14} className="animate-spin" /> : "Create"}
              </button>
              <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-muted text-sm">Loading batches…</div>
        ) : batches.length === 0 ? (
          <div className="panel text-center py-12 text-muted">No batches yet. Create your first batch above.</div>
        ) : (
          <div className="panel p-0 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Data points</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.batchId}>
                    <td className="font-medium text-foreground">{b.batchName}</td>
                    <td className="font-mono">{b.overallScore}</td>
                    <td><GradeBadge grade={b.overallGrade} /></td>
                    <td><span className={statusColor[b.status] ?? "badge-amber"}>{b.status}</span></td>
                    <td><span className={approvalColor[b.approvalStatus] ?? "badge-amber"}>{b.approvalStatus}</span></td>
                    <td className="font-mono text-muted">{b.dataPoints}</td>
                    <td className="text-muted text-xs">{format(new Date(b.createdAt), "dd MMM yyyy")}</td>
                    <td>
                      <Link href={`/farmer/batch/${b.batchId}`} className="text-accent-green text-xs hover:underline">
                        View →
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
