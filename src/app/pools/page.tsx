import PoolList from "@/components/pools/PoolList";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";

export default function PoolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-display)" }}>
            Liquidity Pools
          </h1>
          <p className="text-sm text-white/40">
            Provide liquidity and earn fees from every swap
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pools/add"
            className="btn-aqua flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          >
            <Plus size={15} />
            Add Liquidity
          </Link>
        </div>
      </div>

      {/* Pool type tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button className="tab-btn active flex items-center gap-1.5">
          <Layers size={13} />
          Classic Pools
        </button>
        <button className="tab-btn flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00c8e8]" />
          Concentrated
        </button>
        <div className="ml-auto text-xs text-white/30 font-mono">
          V2 Fee: 0.25% · Protocol: 0.04%
        </div>
      </div>

      <PoolList />
    </div>
  );
}
