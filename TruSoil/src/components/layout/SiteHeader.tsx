"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "See it live", href: "#preview" },
  { label: "The grades", href: "#grades" },
  { label: "The tech", href: "#tech" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/7 bg-background/80 backdrop-blur-xl py-3"
          : "border-b border-transparent bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center group-hover:bg-accent-green/15 transition-colors">
            <Leaf size={16} className="text-accent-green" />
          </span>
          <span className="font-serif text-xl text-foreground">TruSoil</span>
        </Link>

        {/* Center nav — desktop only */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-white/5 transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-muted hover:text-foreground transition-colors px-2">
            Sign in
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
            Get certified
          </Link>
        </div>
      </div>
    </header>
  );
}
