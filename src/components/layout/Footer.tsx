import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(0,200,232,0.08)] bg-[#050d1f]/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/swap" className="flex items-center gap-2 mb-3">
              <div className="relative w-7 h-7">
                <Image src="/logo.png" alt="AquaDex" fill className="object-contain" />
              </div>
              <span className="font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Aqua<span className="text-[#00c8e8]">Dex</span>
              </span>
            </Link>
            <p className="text-xs text-white/40 leading-relaxed max-w-[180px]">
              The hybrid DEX on Monad. Classic + Concentrated Liquidity.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://twitter.com/aquadex" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-[#00c8e8] transition-colors">
                <Twitter size={16} />
              </a>
              <a href="https://discord.gg/aquadex" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-[#00c8e8] transition-colors">
                <MessageCircle size={16} />
              </a>
              <a href="https://github.com/aquadex" target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-[#00c8e8] transition-colors">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Trade */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-display)" }}>Trade</h4>
            <ul className="space-y-2">
              {[["Swap", "/swap"], ["Pools", "/pools"], ["Farm", "/farm"], ["Portfolio", "/portfolio"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-display)" }}>Info</h4>
            <ul className="space-y-2">
              {[["Roadmap", "/roadmap"], ["Docs", "#"], ["Audit", "#"], ["Bug Bounty", "#"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Network */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-display)" }}>Network</h4>
            <ul className="space-y-2">
              {[
                ["MonadScan", "https://monadscan.com"],
                ["MonadVision", "https://monadvision.com"],
                ["Monad.xyz", "https://monad.xyz"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/5 gap-2">
          <p className="text-xs text-white/25">
            © 2026 AquaDex. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Chain ID: 143 · Monad Mainnet ·{" "}
            <span className="text-[#00c8e8]/50">Flow Deeper on Monad</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
