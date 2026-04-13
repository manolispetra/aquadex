import SwapWidget from "@/components/swap/SwapWidget";
import StatsBar from "@/components/swap/StatsBar";

export default function SwapPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <StatsBar />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">
          {/* Heading */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Swap tokens
            </h1>
            <p className="text-sm text-white/40">
              Auto-routes between Classic and Concentrated Liquidity pools
            </p>
          </div>
          <SwapWidget />
        </div>
      </div>
    </div>
  );
}
