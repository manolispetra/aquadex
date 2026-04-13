import AddLiquidityWidget from "@/components/pools/AddLiquidityWidget";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddLiquidityPage() {
  return (
    <div className="max-w-[520px] mx-auto px-4 py-10">
      <Link
        href="/pools"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Pools
      </Link>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-display)" }}>
          Add Liquidity
        </h1>
        <p className="text-sm text-white/40">
          Deposit tokens to earn 0.21% of every swap
        </p>
      </div>
      <AddLiquidityWidget />
    </div>
  );
}
