"use client";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const progress = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color = score >= 90 ? "#4ade80" : score >= 75 ? "#86efac" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-xs text-muted mt-0.5">{grade}</span>
      </div>
    </div>
  );
}
