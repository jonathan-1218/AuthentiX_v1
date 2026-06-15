"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";

type Role = "farmer" | "government_officer";

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-accent-red", "bg-accent-amber", "bg-accent-teal", "bg-accent-green"];

function isValidIndianPhone(phone: string) {
  return /^[6-9]\d{9}$/.test(phone);
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    farmName: "",
    governmentDepartment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const strength = passwordStrength(form.password);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Only allow digits, max 10
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: digits }));
    if (digits.length > 0 && !isValidIndianPhone(digits)) {
      setPhoneError("Must be 10 digits starting with 6, 7, 8 or 9");
    } else {
      setPhoneError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    if (!isValidIndianPhone(form.phone)) {
      setPhoneError("Must be a valid 10-digit Indian mobile number");
      return;
    }

    if (role === "farmer" && !form.farmName.trim()) {
      setError("Farm name is required");
      return;
    }
    if (role === "government_officer" && !form.governmentDepartment.trim()) {
      setError("Department is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); return; }

      if (role === "farmer") router.push("/farmer/dashboard");
      else router.push("/government/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AmbientBackground />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Leaf size={20} className="text-accent-green" />
              <span className="font-serif text-2xl">TruSoil</span>
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">Create an account</h1>
            <p className="text-muted text-sm mt-1">Join the organic certification network</p>
          </div>

          <div className="panel">
            {/* Step 1: Pick role */}
            {!role && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground mb-4">I am a…</p>
                <button
                  onClick={() => setRole("farmer")}
                  className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/3 hover:border-accent-green/30 hover:bg-accent-green/5 transition-all"
                >
                  <span className="font-medium text-foreground block">Farmer</span>
                  <span className="text-xs text-muted">Register my farm and submit batches for certification</span>
                </button>
                <button
                  onClick={() => setRole("government_officer")}
                  className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/3 hover:border-accent-teal/30 hover:bg-accent-teal/5 transition-all"
                >
                  <span className="font-medium text-foreground block">Government Officer</span>
                  <span className="text-xs text-muted">Verify and approve organic certifications</span>
                </button>
              </div>
            )}

            {/* Step 2: Fill details */}
            {role && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <button type="button" onClick={() => { setRole(null); setError(""); setPhoneError(""); }} className="text-xs text-muted hover:text-foreground mb-2">
                  ← Change role
                </button>

                <div>
                  <label className="label">Full name <span className="text-accent-red">*</span></label>
                  <input
                    className="input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={set("name")}
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="label">Email <span className="text-accent-red">*</span></label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    required
                  />
                </div>

                <div>
                  <label className="label">Password <span className="text-accent-red">*</span></label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password}
                    onChange={set("password")}
                    required
                    minLength={8}
                  />
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : "bg-white/10"}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${strength <= 1 ? "text-accent-red" : strength <= 2 ? "text-accent-amber" : "text-accent-green"}`}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">
                    Mobile number <span className="text-accent-red">*</span>
                    <span className="text-muted normal-case font-normal ml-1">(10 digits, no +91)</span>
                  </label>
                  <input
                    type="tel"
                    className={`input ${phoneError ? "border-accent-red/50" : ""}`}
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    required
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {phoneError && (
                    <p className="text-xs text-accent-red mt-1">{phoneError}</p>
                  )}
                  {form.phone.length === 10 && !phoneError && (
                    <p className="text-xs text-accent-green mt-1">Valid mobile number</p>
                  )}
                </div>

                {role === "farmer" && (
                  <div>
                    <label className="label">Farm name <span className="text-accent-red">*</span></label>
                    <input
                      className="input"
                      placeholder="e.g. Green Valley Farm"
                      value={form.farmName}
                      onChange={set("farmName")}
                      required
                    />
                  </div>
                )}

                {role === "government_officer" && (
                  <div>
                    <label className="label">Department <span className="text-accent-red">*</span></label>
                    <input
                      className="input"
                      placeholder="e.g. Agriculture Dept., Tamil Nadu"
                      value={form.governmentDepartment}
                      onChange={set("governmentDepartment")}
                      required
                    />
                  </div>
                )}

                {error && (
                  <div className="px-3 py-2.5 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !!phoneError || form.phone.length !== 10}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Create account"}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-sm text-muted">
              Already registered?{" "}
              <Link href="/auth/login" className="text-accent-green hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
