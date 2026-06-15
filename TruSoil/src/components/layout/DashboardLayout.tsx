"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart2, CheckCircle, FileText, LayoutDashboard,
  LogOut, Settings, ShieldCheck, Users, Leaf, type LucideIcon,
} from "lucide-react";
import { AmbientBackground } from "./AmbientBackground";

interface NavItem { label: string; href: string; icon: LucideIcon }

const farmerNav: NavItem[] = [
  { label: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
  { label: "Batches", href: "/farmer/batches", icon: FileText },
  { label: "Profile", href: "/farmer/profile", icon: Settings },
];

const govNav: NavItem[] = [
  { label: "Verification Queue", href: "/government/dashboard", icon: LayoutDashboard },
  { label: "Approved", href: "/government/approved", icon: CheckCircle },
  { label: "Reports", href: "/government/reports", icon: BarChart2 },
  { label: "Profile", href: "/government/profile", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
  { label: "System Health", href: "/admin/system-health", icon: ShieldCheck },
];

const navByRole: Record<string, NavItem[]> = {
  farmer: farmerNav,
  government_officer: govNav,
  admin: adminNav,
};

const labelByRole: Record<string, string> = {
  farmer: "Farmer Portal",
  government_officer: "Government Portal",
  admin: "Admin Console",
};

interface Props {
  role: "farmer" | "government_officer" | "admin";
  children: React.ReactNode;
}

export function DashboardLayout({ role, children }: Props) {
  const pathname = usePathname();
  const nav = navByRole[role] ?? [];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  }

  return (
    <div className="min-h-screen flex">
      <AmbientBackground />

      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/7 bg-background/80 backdrop-blur-xl">
        <div className="p-5 border-b border-white/7">
          <Link href="/" className="flex items-center gap-2">
            <Leaf size={18} className="text-accent-green" />
            <span className="font-serif text-lg text-foreground">TruSoil</span>
          </Link>
          <p className="text-xs text-muted mt-1">{labelByRole[role]}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${pathname === href || pathname.startsWith(href + "/") ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/7">
          <button onClick={handleLogout} className="sidebar-link w-full text-accent-red hover:bg-accent-red/5">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
