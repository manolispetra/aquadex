"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X, Droplets, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

const NAV_LINKS = [
  { href: "/swap",      label: "Swap" },
  { href: "/pools",     label: "Pools" },
  { href: "/farm",      label: "Farm",      badge: "Soon" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/roadmap",   label: "Roadmap" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#050d1f]/95 backdrop-blur-xl border-b border-[rgba(0,200,232,0.1)] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/swap" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110 duration-200">
              <Image src="/logo.png" alt="AquaDex" fill className="object-contain" />
            </div>
            <span
              className="text-lg font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Aqua<span className="text-[#00c8e8]">Dex</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "nav-link px-3 py-2 rounded-lg flex items-center gap-1.5",
                  pathname.startsWith(link.href) && "active"
                )}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(0,200,232,0.15)] text-[#00c8e8] border border-[rgba(0,200,232,0.2)]">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right: stats + connect */}
          <div className="hidden md:flex items-center gap-3">
            {/* MON price mock */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,200,232,0.06)] border border-[rgba(0,200,232,0.12)]">
              <Droplets size={13} className="text-[#00c8e8]" />
              <span className="text-xs font-mono text-[#00c8e8]">MON</span>
              <span className="text-xs font-mono text-white/70">Monad</span>
            </div>
            <ConnectButton
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={false}
            />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#050d1f]/98 backdrop-blur-xl border-t border-[rgba(0,200,232,0.1)] animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-[#00c8e8] bg-[rgba(0,200,232,0.08)]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  {link.label}
                </span>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(0,200,232,0.15)] text-[#00c8e8]">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
