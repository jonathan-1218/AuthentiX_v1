import Link from "next/link";
import {
  ArrowRight, Cpu, Droplets, Link2, QrCode, ScanLine,
  ShieldCheck, Sprout, Thermometer, TriangleAlert,
} from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Reveal } from "@/components/layout/Reveal";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ScoreRing } from "@/components/ui/ScoreRing";

const steps = [
  {
    icon: Sprout,
    title: "A sensor sits in the field",
    body: "It quietly checks the soil and air all day — how wet it is, how healthy, whether any pesticide shows up. Nobody has to remember to write anything down.",
  },
  {
    icon: ShieldCheck,
    title: "Nobody can fudge it later",
    body: "Once a reading is in, it's in. Not the farmer, not us, not an inspector can go back and quietly change a number to make things look better.",
  },
  {
    icon: ScanLine,
    title: "You check it yourself",
    body: "Point your phone at the QR code on the pack. You'll see exactly how that food was grown and whether anyone messed with the records. No middleman.",
  },
];

const grades = [
  { grade: "A+", label: "The real deal", body: "No synthetic pesticides at all. This is as clean as organic gets." },
  { grade: "A", label: "Pretty much spotless", body: "Grown clean, with only tiny slips that the farmer wrote down honestly." },
  { grade: "B", label: "Mostly there", body: "Good farming, but something came up that the farmer had to explain." },
  { grade: "C", label: "Worth a closer look", body: "Something didn't add up. An officer needs to visit before you trust it." },
];

const techExplainers = [
  {
    icon: Cpu,
    term: "NPOP grading",
    plain: "India's official organic rulebook",
    body: "The government already has rules for what gets to call itself organic. We just check every farm against those rules automatically. So the grade you see isn't us deciding — it's the actual standard, done by the numbers.",
  },
  {
    icon: Link2,
    term: "Merkle root",
    plain: "A fingerprint for the data",
    body: "Picture squeezing thousands of readings down into one short code, like a fingerprint. Touch even one reading and the whole fingerprint changes. So if someone tries to sneak in a fake number, it's obvious right away.",
  },
  {
    icon: ShieldCheck,
    term: "Blockchain",
    plain: "A notebook nobody can erase",
    body: "That fingerprint gets written into a public notebook that lives on thousands of computers at once. There's no eraser. No company or official can go back later and quietly rewrite what happened.",
  },
];

export default function LandingPage() {
  return (
    <>
      <AmbientBackground />

      {/* Nav */}
      <SiteHeader />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 overflow-hidden">
        {/* real farm photo, washed in the dark-green palette */}
        <div className="hero-photo" aria-hidden />

        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-green/20 bg-accent-green/5 text-accent-green text-xs font-medium mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          Live on Ethereum Sepolia
        </div>

        <h1 className="relative z-10 font-serif text-6xl md:text-7xl lg:text-8xl text-foreground leading-tight max-w-4xl">
          Trust grows from<br />
          <em className="text-gradient not-italic">the soil up</em>
        </h1>

        <p className="relative z-10 mt-6 text-lg text-foreground/70 max-w-xl leading-relaxed">
          You see &ldquo;organic&rdquo; on a label and you just hope it&apos;s true, right?
          We thought that wasn&apos;t good enough. So we put sensors in the field, locked the
          records so nobody can fake them, and made it all something you can check yourself.
        </p>

        <div className="relative z-10 mt-10 flex items-center gap-4">
          <a href="#how" className="btn-primary px-7 py-3 text-base">
            See how it works
          </a>
          <Link href="/auth/register" className="btn-ghost px-7 py-3 text-base backdrop-blur-sm">
            Get your farm certified
          </Link>
        </div>

        <div className="relative z-10 mt-20 flex items-center gap-4 flex-wrap justify-center">
          {(["A+", "A", "B", "C"] as const).map((g) => (
            <div key={g} className={`grade-${g === "A+" ? "aplus" : g.toLowerCase()} text-xl px-6 py-3 backdrop-blur-sm`}>
              {g}
            </div>
          ))}
        </div>
        <p className="relative z-10 mt-3 text-xs text-foreground/50">Every product gets an honest grade</p>
      </section>

      {/* The problem */}
      <section className="relative px-6 py-28 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal className="photo-tile aspect-[4/5] md:aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=80&auto=format&fit=crop"
              alt="A farmer holding rich, dark soil with a young seedling"
            />
          </Reveal>
          <Reveal delay={120}>
            <TriangleAlert size={28} className="text-accent-amber mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
              Anyone can print &ldquo;organic&rdquo; on a label.
            </h2>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Right now the word means whatever the seller wants it to mean. You pay extra and
              cross your fingers. Meanwhile the farmers actually doing it right lose out to people
              who just slapped a sticker on. We wanted a way to genuinely{" "}
              <span className="text-foreground">prove</span> who&apos;s honest.
            </p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative px-6 py-28 max-w-6xl mx-auto scroll-mt-24">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-medium text-accent-green uppercase tracking-widest mb-3">How it works</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">It&apos;s honestly pretty simple</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 120}>
              <div className="panel h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-accent-green/40 text-sm">0{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-accent-green/10 flex items-center justify-center">
                    <Icon size={16} className="text-accent-green" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Live dashboard preview */}
      <section id="preview" className="relative px-6 py-28 max-w-5xl mx-auto scroll-mt-24">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-medium text-accent-green uppercase tracking-widest mb-3">See it live</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">Here&apos;s what we actually track</h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">This is a real farm&apos;s page — the same thing an officer looks at before they sign off on a certificate.</p>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel-elevated p-6 md:p-8">
            {/* Mock dashboard header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <p className="text-xs text-muted">Farm</p>
                <p className="font-serif text-2xl text-foreground">Green Valley Organics</p>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                  Live · Erode, Tamil Nadu
                </p>
              </div>
              <div className="grade-aplus text-2xl px-5 py-2">A+</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              {/* Score ring */}
              <div className="flex flex-col items-center justify-center panel py-7">
                <ScoreRing score={94} grade="A+" />
                <p className="text-xs text-muted mt-3">Compliance score</p>
              </div>

              {/* Sensor tiles */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {[
                  { label: "Temperature", value: "26°C", icon: Thermometer },
                  { label: "Soil moisture", value: "48%", icon: Droplets },
                  { label: "Soil pH", value: "6.6", icon: Sprout },
                  { label: "Pesticide", value: "0.0 ppm", icon: ShieldCheck },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="panel">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted">{label}</span>
                      <Icon size={14} className="text-accent-green" />
                    </div>
                    <p className="text-xl font-mono font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini sparkline */}
            <div className="mt-5 panel">
              <p className="text-xs text-muted mb-3">30-day soil health trend</p>
              <svg viewBox="0 0 600 80" className="w-full h-16" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 C50,55 90,40 140,42 C190,44 230,25 280,30 C330,35 370,18 420,22 C470,26 520,15 600,20 L600,80 L0,80 Z"
                  fill="url(#spark)"
                />
                <path
                  d="M0,60 C50,55 90,40 140,42 C190,44 230,25 280,30 C330,35 370,18 420,22 C470,26 520,15 600,20"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* Blockchain proof line */}
            <div className="mt-5 flex items-center gap-3 text-xs text-accent-teal panel">
              <Link2 size={14} className="shrink-0" />
              <span className="font-mono break-all">Sealed on-chain · 0x7a3f…d29b · verified ✓</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Grades explained */}
      <section id="grades" className="relative px-6 py-28 max-w-5xl mx-auto scroll-mt-24">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-medium text-accent-green uppercase tracking-widest mb-3">The grades</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">So what do the letters mean?</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {grades.map(({ grade, label, body }, i) => (
            <Reveal key={grade} delay={i * 100}>
              <div className="panel h-full">
                <div className={`grade-${grade === "A+" ? "aplus" : grade.toLowerCase()} text-2xl px-4 py-2 mb-4 w-fit`}>
                  {grade}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{label}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* The tech, explained */}
      <section id="tech" className="relative px-6 py-28 max-w-5xl mx-auto scroll-mt-24">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-medium text-accent-green uppercase tracking-widest mb-3">For the curious</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">&ldquo;Okay, but how does it really work?&rdquo;</h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">You can skip this part and still trust the label completely. But if you&apos;re the type who wants to know what&apos;s under the hood, here you go.</p>
        </Reveal>
        <div className="space-y-5">
          {techExplainers.map(({ icon: Icon, term, plain, body }, i) => (
            <Reveal key={term} delay={i * 100}>
              <div className="panel-elevated flex flex-col md:flex-row gap-5 md:gap-8 md:items-center">
                <div className="flex items-center gap-4 md:w-64 shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-accent-green/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-accent-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{term}</p>
                    <p className="text-xs text-accent-green">{plain}</p>
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Full-bleed real farm band */}
      <section className="relative my-10">
        <div className="photo-band">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1920&q=80&auto=format&fit=crop"
            alt="Rows of crops on a real farm at golden hour"
          />
          <div className="photo-band-content">
            <Reveal>
              <p className="font-serif text-3xl md:text-4xl text-foreground max-w-2xl mx-auto leading-snug">
                Real fields. Real readings. A record the world can check.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-32 text-center">
        <Reveal>
          <div className="panel max-w-2xl mx-auto py-16">
            <QrCode size={32} className="text-accent-green mx-auto mb-5" />
            <h2 className="font-serif text-4xl text-foreground mb-4">Grow it right? Show it.</h2>
            <p className="text-muted mb-8 max-w-md mx-auto">If you&apos;re putting in the work to farm clean, you shouldn&apos;t have to argue about it. Get certified and let your customers see the proof for themselves.</p>
            <Link href="/auth/register" className="btn-primary px-8 py-3 text-base inline-flex">
              Get your farm certified
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/7 px-8 py-6 flex items-center justify-between text-xs text-muted flex-wrap gap-3">
        <span>© 2026 TruSoil. Built for Tamil Nadu organic farmers.</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          Sepolia Testnet
        </span>
      </footer>
    </>
  );
}
