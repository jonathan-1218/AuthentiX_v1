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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl py-3 shadow-sm shadow-black/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center group-hover:bg-accent-green/15 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent-green/20">
            <Leaf size={16} className="text-accent-green transition-transform duration-300 group-hover:scale-110" />
          </span>
          <span className="font-serif text-xl text-foreground transition-colors duration-300">TruSoil</span>
        </Link>

        {/* Center nav — desktop only */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-sm text-muted hover:text-accent-green transition-all duration-300 relative group"
            >
              {label}
              <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-accent-green to-accent-green/60 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-muted hover:text-accent-green transition-all duration-300 px-2 py-1 rounded-lg hover:bg-white/5">
            Sign in
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm py-2 px-4 transition-all duration-300 hover:shadow-lg hover:shadow-accent-green/30">
            Get certified
          </Link>
        </div>
      </div>
    </header>
  );
}
