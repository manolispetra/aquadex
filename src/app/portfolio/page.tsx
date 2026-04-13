import PortfolioDashboard from "@/components/portfolio/PortfolioDashboard";

export default function PortfolioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-display)" }}>
          Portfolio
        </h1>
        <p className="text-sm text-white/40">
          Your positions, balances, and earned fees
        </p>
      </div>
      <PortfolioDashboard />
    </div>
  );
}
