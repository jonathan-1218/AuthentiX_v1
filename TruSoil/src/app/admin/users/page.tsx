"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { format } from "date-fns";

interface User { userId: string; email: string; name: string; role: string; isActive: boolean; lastLogin?: string; createdAt: string }

const roleColor: Record<string, string> = {
  farmer: "badge-green",
  government_officer: "badge-teal",
  admin: "badge-amber",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (roleFilter) params.set("role", roleFilter);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.data?.users ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleActive(userId: string, current: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setUsers((u) => u.map((x) => x.userId === userId ? { ...x, isActive: !current } : x));
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">User Management</h1>
          <p className="text-muted text-sm mt-1">{users.length} users loaded</p>
        </div>

        <div className="flex gap-3">
          <input className="input max-w-xs" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <select className="input max-w-[180px]" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); }}>
            <option value="">All roles</option>
            <option value="farmer">Farmer</option>
            <option value="government_officer">Officer</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={load} className="btn-ghost">Search</button>
        </div>

        {loading ? <p className="text-muted text-sm">Loading…</p> : (
          <div className="panel p-0 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td className="font-medium text-foreground">{u.name}</td>
                    <td className="text-muted text-xs">{u.email}</td>
                    <td><span className={roleColor[u.role] ?? "badge-amber"}>{u.role}</span></td>
                    <td><span className={u.isActive ? "badge-green" : "badge-red"}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="text-muted text-xs">{u.lastLogin ? format(new Date(u.lastLogin), "dd MMM yy") : "Never"}</td>
                    <td className="text-muted text-xs">{format(new Date(u.createdAt), "dd MMM yy")}</td>
                    <td>
                      <button onClick={() => toggleActive(u.userId, u.isActive)} className={u.isActive ? "btn-danger py-1 px-3 text-xs" : "btn-ghost py-1 px-3 text-xs"}>
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
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
