"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }

      const role = data.data?.role;
      if (role === "farmer") router.push("/farmer/dashboard");
      else if (role === "government_officer") router.push("/government/dashboard");
      else if (role === "admin") router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AmbientBackground />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Leaf size={20} className="text-accent-green" />
              <span className="font-serif text-2xl">TruSoil</span>
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
            <p className="text-muted text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="panel">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-accent-green hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
