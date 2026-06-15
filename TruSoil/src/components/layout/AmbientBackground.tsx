"use client";

import { useEffect, useRef } from "react";

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--pointer-x", `${x}%`);
      document.documentElement.style.setProperty("--pointer-y", `${y}%`);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="ambient-bg" aria-hidden>
      {/* soft glow that follows the cursor */}
      <div className="ambient-glow" />

      {/* topographic contour lines — evokes soil / land */}
      <svg
        className="ambient-contours"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="#4ade80" strokeWidth="1">
          <path d="M-50,180 C200,120 380,240 600,200 C820,160 1000,260 1250,200" />
          <path d="M-50,260 C200,200 380,320 600,280 C820,240 1000,340 1250,280" />
          <path d="M-50,360 C220,300 400,420 620,380 C840,340 1020,430 1250,380" />
          <path d="M-50,470 C240,410 420,520 640,480 C860,440 1040,520 1250,470" />
          <path d="M-50,580 C260,520 440,620 660,580 C880,540 1060,610 1250,560" />
          <path d="M-50,690 C280,630 460,720 680,680 C900,640 1080,700 1250,660" />
        </g>
        <g stroke="#2dd4bf" strokeWidth="1" opacity="0.5">
          <path d="M-50,220 C200,160 380,280 600,240 C820,200 1000,300 1250,240" />
          <path d="M-50,420 C230,360 410,470 630,430 C850,390 1030,475 1250,425" />
          <path d="M-50,630 C270,575 450,665 670,630 C890,590 1070,655 1250,610" />
        </g>
      </svg>

      {/* fine film grain so it isn't a flat digital void */}
      <div className="ambient-grain" />
    </div>
  );
}
