import Link from "next/link";
import { Sprout, Lock, ArrowLeft } from "lucide-react";

export default function FarmPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-display)" }}>
          Farm
        </h1>
        <p className="text-sm text-white/40">Stake LP tokens and earn AQUA rewards</p>
      </div>

      {/* Coming soon cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {[
          { name: "WMON/AQUA", apr: "TBD", tvl: "—", tag: "Classic" },
          { name: "WMON/USDC", apr: "TBD", tvl: "—", tag: "Classic" },
        ].map((farm) => (
          <div key={farm.name}
            className="glass-card rounded-2xl p-5 relative overflow-hidden opacity-60">
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(2,8,18,0.7)] z-10 rounded-2xl">
              <div className="text-center">
                <Lock size={20} className="text-[#00c8e8]/50 mx-auto mb-2" />
                <span className="text-sm text-white/50" style={{ fontFamily: "var(--font-display)" }}>
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-[rgba(0,200,232,0.15)] border-2 border-[#091426] flex items-center justify-center z-10">
                    <span className="text-[11px] font-bold text-[#00c8e8]">W</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[rgba(77,184,255,0.15)] border-2 border-[#091426] flex items-center justify-center">
                    <span className="text-[11px] font-bold text-[#4db8ff]">A</span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {farm.name}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(0,200,232,0.1)] text-[#00c8e8]">
                    {farm.tag}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/30">APR</div>
                <div className="font-mono font-bold text-green-400">{farm.apr}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[["TVL", farm.tvl], ["Earned", "0 AQUA"], ["Multiplier", "1x"]].map(([l, v]) => (
                <div key={l} className="bg-[rgba(0,0,0,0.3)] rounded-xl p-2">
                  <div className="text-xs text-white/30">{l}</div>
                  <div className="font-mono text-sm text-white/70">{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AQUA info */}
      <div className="glass-card rounded-2xl p-6 text-center max-w-md mx-auto">
        <Sprout size={28} className="text-[#00c8e8] mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
          AQUA Rewards
        </h3>
        <p className="text-sm text-white/40 mb-4">
          Farm launches after initial liquidity pools are seeded.
          Provide liquidity now to be ready.
        </p>
        <Link href="/pools/add"
          className="btn-aqua inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
          Add Liquidity First
        </Link>
      </div>
    </div>
  );
}
