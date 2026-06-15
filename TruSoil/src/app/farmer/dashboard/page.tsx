"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { AlertTriangle, Droplets, Thermometer, Wind } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import type { Grade } from "@/types";

interface DailyPoint {
  date: string;
  avgTemperature: number;
  avgHumidity: number;
  avgSoilMoisture: number;
  avgPH: number;
  avgPesticide: number;
  avgScore: number;
  grade: Grade;
}

interface Stats {
  avgTemperature: number;
  avgHumidity: number;
  avgPH: number;
  maxPesticide: number;
  latestScore: number;
  latestGrade: Grade;
}

export default function FarmerDashboard() {
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the farmer's first farm from their batches
    fetch("/api/batches")
      .then((r) => r.json())
      .then(async (data) => {
        const batch = data.data?.batches?.[0];
        if (!batch) { setLoading(false); return; }
        setFarmId(batch.farmId);

        const [dailyRes, statsRes] = await Promise.all([
          fetch(`/api/sensor-data/${batch.farmId}/daily`).then((r) => r.json()),
          fetch(`/api/sensor-data/${batch.farmId}`).then((r) => r.json()),
        ]);

        setDaily(dailyRes.data?.daily ?? []);
        setStats(statsRes.data?.stats ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const score = stats?.latestScore ?? 0;
  const grade = stats?.latestGrade ?? "C";

  return (
    <DashboardLayout role="farmer">
      <div className="max-w-6xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Live farm sensor overview</p>
        </div>

        {loading ? (
          <div className="text-muted text-sm">Loading sensor data…</div>
        ) : !farmId ? (
          <div className="panel text-center py-12">
            <p className="text-muted mb-4">No active batches found.</p>
            <a href="/farmer/batches" className="btn-primary">Create your first batch</a>
          </div>
        ) : (
          <>
            {/* Score + quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="panel flex flex-col items-center justify-center py-8 md:col-span-1">
                <ScoreRing score={score} grade={grade} />
                <p className="text-xs text-muted mt-3 text-center">Compliance Score</p>
                <div className="mt-2">
                  <GradeBadge grade={grade} size="lg" />
                </div>
              </div>

              <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Temperature", value: `${stats?.avgTemperature ?? "—"}°C`, icon: Thermometer, ok: true },
                  { label: "Humidity", value: `${stats?.avgHumidity ?? "—"}%`, icon: Wind, ok: true },
                  { label: "Soil pH", value: stats?.avgPH ?? "—", icon: Droplets, ok: (stats?.avgPH ?? 0) >= 6 && (stats?.avgPH ?? 0) <= 7 },
                  { label: "Peak Pesticide", value: `${stats?.maxPesticide ?? "—"} ppm`, icon: AlertTriangle, ok: (stats?.maxPesticide ?? 999) < 5 },
                ].map(({ label, value, icon: Icon, ok }) => (
                  <div key={label} className="panel">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted">{label}</span>
                      <Icon size={14} className={ok ? "text-accent-green" : "text-accent-amber"} />
                    </div>
                    <p className="text-xl font-mono font-semibold text-foreground">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-day chart */}
            <div className="panel">
              <div className="mb-5">
                <p className="text-xs text-muted uppercase tracking-wide">30-day trend</p>
                <h3 className="text-lg font-semibold text-foreground mt-0.5">Sensor readings</h3>
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={daily}>
                    <defs>
                      {[
                        { id: "temp", color: "#06b6d4" },
                        { id: "humidity", color: "#22c55e" },
                        { id: "moisture", color: "#67e8f9" },
                        { id: "score", color: "#4ade80" },
                      ].map(({ id, color }) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#0f1410", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="avgTemperature" name="Temp (°C)" stroke="#06b6d4" fill="url(#temp)" strokeWidth={2} />
                    <Area type="monotone" dataKey="avgHumidity" name="Humidity (%)" stroke="#22c55e" fill="url(#humidity)" strokeWidth={2} />
                    <Area type="monotone" dataKey="avgSoilMoisture" name="Moisture (%)" stroke="#67e8f9" fill="url(#moisture)" strokeWidth={2} />
                    <Area type="monotone" dataKey="avgScore" name="Score" stroke="#4ade80" fill="url(#score)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
