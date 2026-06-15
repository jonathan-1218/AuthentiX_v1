"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function FarmerProfilePage() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Placeholder — wire to a /api/auth/change-password endpoint if needed
    await new Promise((r) => setTimeout(r, 1000));
    setMsg("Password updated.");
    setSaving(false);
  }

  return (
    <DashboardLayout role="farmer">
      <div className="max-w-xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Profile</h1>
          <p className="text-muted text-sm mt-1">Manage your account settings</p>
        </div>

        <div className="panel space-y-5">
          <h3 className="font-semibold text-foreground">Change password</h3>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="label">Current password</label>
              <input type="password" className="input" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
            </div>
            <div>
              <label className="label">New password</label>
              <input type="password" className="input" placeholder="Min 8 chars, 1 uppercase, 1 number" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
            </div>
            {msg && <p className="text-accent-green text-sm">{msg}</p>}
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
