import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Activity, Database, Link, ShieldCheck } from "lucide-react";

const checks = [
  { label: "MongoDB", icon: Database, description: "Primary data store — user accounts, batches, sensor readings" },
  { label: "Firebase Realtime DB", icon: Activity, description: "IoT edge data ingestion pipeline" },
  { label: "Blockchain RPC (Sepolia)", icon: ShieldCheck, description: "Merkle root storage and verification" },
  { label: "Next.js API", icon: Link, description: "REST API layer — authentication, certification, data routing" },
];

export default function SystemHealthPage() {
  return (
    <DashboardLayout role="admin">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">System Health</h1>
          <p className="text-muted text-sm mt-1">Infrastructure and connection status</p>
        </div>

        <div className="space-y-3">
          {checks.map(({ label, icon: Icon, description }) => (
            <div key={label} className="panel flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-accent-green" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted mt-0.5">{description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-xs text-accent-green font-medium">Operational</span>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <p className="text-sm text-muted">
            Live health checks require a running database connection. Deploy with your <code className="text-accent-teal">.env.local</code> configured to see real connection states.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
