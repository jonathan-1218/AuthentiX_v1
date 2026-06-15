import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function GovProfilePage() {
  return (
    <DashboardLayout role="government_officer">
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Officer Profile</h1>
          <p className="text-muted text-sm mt-1">Your account details</p>
        </div>
        <div className="panel">
          <p className="text-sm text-muted">Profile management coming soon. Contact your admin to update department or region details.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
