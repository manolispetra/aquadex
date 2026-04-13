"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { V2_FACTORY_ABI } from "@/lib/abis";
import { TrendingUp, Droplets, Activity, Zap } from "lucide-react";

const STAT_ITEMS = [
  { icon: Droplets,  label: "Total Pools",    value: "—",   color: "#00c8e8" },
  { icon: TrendingUp,label: "24h Volume",     value: "$—",  color: "#4db8ff" },
  { icon: Activity,  label: "Total TVL",      value: "$—",  color: "#00c8e8" },
  { icon: Zap,       label: "Chain",          value: "Monad", color: "#7c9fff" },
];

export default function StatsBar() {
  const { data: pairCount } = useReadContract({
    address: CONTRACTS.V2_FACTORY as `0x${string}`,
    abi: V2_FACTORY_ABI,
    functionName: "allPairsLength",
  });

  return (
    <div className="border-b border-[rgba(0,200,232,0.07)] bg-[rgba(5,13,31,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
          {STAT_ITEMS.map(({ icon: Icon, label, value, color }, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon size={12} style={{ color }} />
              <span className="text-xs text-white/30">{label}:</span>
              <span className="text-xs font-mono font-medium text-white/70">
                {label === "Total Pools" && pairCount !== undefined
                  ? pairCount.toString()
                  : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
