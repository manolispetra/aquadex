import RoadmapContent from "@/components/roadmap/RoadmapContent";

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,200,232,0.08)] border border-[rgba(0,200,232,0.15)] text-xs text-[#00c8e8] mb-4"
          style={{ fontFamily: "var(--font-display)" }}>
          ◎ Monad Mainnet — April 2026
        </div>
        <h1 className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}>
          Roadmap
        </h1>
        <p className="text-white/40 max-w-lg mx-auto">
          AquaDex is building the deepest liquidity layer on Monad.
          Here&apos;s where we&apos;re headed.
        </p>
      </div>
      <RoadmapContent />
    </div>
  );
}
