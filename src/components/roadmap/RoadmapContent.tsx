"use client";

import { CheckCircle2, Clock, Lock, Zap, Droplets, Shield, Globe, Coins, BarChart2, Users, Code2, Star } from "lucide-react";
import { clsx } from "clsx";

type Status = "done" | "active" | "soon" | "future";

interface RoadmapItem {
  title: string;
  description: string;
  status: Status;
  tags?: string[];
}

interface Phase {
  phase: string;
  title: string;
  period: string;
  status: Status;
  icon: React.ElementType;
  color: string;
  items: RoadmapItem[];
}

const PHASES: Phase[] = [
  {
    phase: "Phase 1",
    title: "Genesis",
    period: "April 2026",
    status: "done",
    icon: Zap,
    color: "#00c8e8",
    items: [
      {
        title: "Smart contract deployment",
        description: "V2 Factory, V2 Router, V3 Factory, V3 Pool, Universal Router, FeeCollector deployed on Monad Mainnet (Chain ID 143).",
        status: "done",
        tags: ["Contracts", "Mainnet"],
      },
      {
        title: "Hybrid routing engine",
        description: "Universal Router auto-selects the best execution path between Classic (V2) and Concentrated Liquidity (V3) pools for every swap.",
        status: "done",
        tags: ["Router", "V2", "V3"],
      },
      {
        title: "Classic pools (V2)",
        description: "Full-range x·y=k AMM with 0.25% total fee (0.21% LP + 0.04% protocol), TWAP oracle, and flash swaps.",
        status: "done",
        tags: ["AMM", "Liquidity"],
      },
      {
        title: "Concentrated Liquidity (V3)",
        description: "Tick-based price ranges with 4 fee tiers (0.01%, 0.05%, 0.30%, 1.00%). LP positions minted as ERC-721 NFTs.",
        status: "done",
        tags: ["CL", "NFT"],
      },
      {
        title: "AQUA token launch",
        description: "1,000,000,000 AQUA governance token deployed with ERC-20Votes and ERC-20Permit support. Full supply minted to treasury.",
        status: "done",
        tags: ["Token", "Governance"],
      },
      {
        title: "Frontend launch",
        description: "Next.js + wagmi frontend with Swap, Pools, Portfolio, Farm (coming soon), and Roadmap pages.",
        status: "done",
        tags: ["Frontend", "UI"],
      },
    ],
  },
  {
    phase: "Phase 2",
    title: "Liquidity",
    period: "Q2 2026",
    status: "active",
    icon: Droplets,
    color: "#4db8ff",
    items: [
      {
        title: "Initial liquidity seeding",
        description: "Deploy WMON/AQUA and WMON/USDC Classic pools with initial protocol-owned liquidity. Set competitive starting prices.",
        status: "active",
        tags: ["Liquidity", "Pools"],
      },
      {
        title: "Token registry expansion",
        description: "Add Monad ecosystem tokens to the AquaDex token list as the Monad DeFi ecosystem grows.",
        status: "active",
        tags: ["Tokens", "Ecosystem"],
      },
      {
        title: "Price oracle integration",
        description: "Integrate TWAP price feeds from Classic pools for use by other protocols on Monad.",
        status: "soon",
        tags: ["Oracle", "DeFi"],
      },
      {
        title: "Liquidity mining (Farm)",
        description: "Stake LP tokens to earn AQUA rewards. Configurable emission schedules per pool with multipliers.",
        status: "soon",
        tags: ["Farm", "AQUA"],
      },
      {
        title: "Advanced analytics dashboard",
        description: "Real-time TVL, volume, fee earnings, and price charts powered by on-chain data from Monad.",
        status: "soon",
        tags: ["Analytics", "Dashboard"],
      },
      {
        title: "Aggregator listing",
        description: "List AquaDex pools on 1inch, Paraswap, and other aggregators to attract external routing volume.",
        status: "soon",
        tags: ["Integrations", "Volume"],
      },
    ],
  },
  {
    phase: "Phase 3",
    title: "Security",
    period: "Q3 2026",
    status: "future",
    icon: Shield,
    color: "#7c9fff",
    items: [
      {
        title: "Professional security audit",
        description: "Full audit of all smart contracts by a top-tier security firm (Trail of Bits, OpenZeppelin, or equivalent).",
        status: "future",
        tags: ["Security", "Audit"],
      },
      {
        title: "Bug bounty program",
        description: "Launch public bug bounty on Immunefi with rewards up to $500k for critical vulnerabilities.",
        status: "future",
        tags: ["Security", "Bug Bounty"],
      },
      {
        title: "Multisig governance transition",
        description: "Transfer protocol admin keys from deployer wallet to a 5-of-9 Gnosis Safe multisig.",
        status: "future",
        tags: ["Governance", "Security"],
      },
      {
        title: "Emergency pause mechanism",
        description: "Add circuit breaker functionality to pause swaps and liquidity operations in case of exploit.",
        status: "future",
        tags: ["Safety", "Contracts"],
      },
    ],
  },
  {
    phase: "Phase 4",
    title: "Growth",
    period: "Q4 2026",
    status: "future",
    icon: BarChart2,
    color: "#00c8e8",
    items: [
      {
        title: "Governance launch",
        description: "On-chain governance via AQUA votes. Token holders propose and vote on fee changes, new pools, and treasury spending.",
        status: "future",
        tags: ["DAO", "AQUA"],
      },
      {
        title: "veAQUA vote-escrow model",
        description: "Lock AQUA for up to 4 years to receive veAQUA. veAQUA holders direct liquidity mining emissions and earn protocol fees.",
        status: "future",
        tags: ["veToken", "DeFi"],
      },
      {
        title: "AQUA staking vault",
        description: "Single-asset AQUA staking to earn a share of protocol fees (both V2 LP tokens and V3 protocol fees).",
        status: "future",
        tags: ["Staking", "Yield"],
      },
      {
        title: "Limit orders",
        description: "Off-chain order book with on-chain settlement. Place GTC/GTD limit orders executed at exact prices.",
        status: "future",
        tags: ["Trading", "Orders"],
      },
      {
        title: "Cross-chain bridge",
        description: "Bridge liquidity to/from other EVM chains. Enable seamless entry into the Monad ecosystem.",
        status: "future",
        tags: ["Bridge", "Cross-chain"],
      },
    ],
  },
  {
    phase: "Phase 5",
    title: "Ecosystem",
    period: "2027",
    status: "future",
    icon: Globe,
    color: "#4db8ff",
    items: [
      {
        title: "Mobile app",
        description: "Native iOS and Android app with full DEX functionality, portfolio tracking, and push notifications for price alerts.",
        status: "future",
        tags: ["Mobile", "App"],
      },
      {
        title: "AquaDex SDK",
        description: "TypeScript/Python SDK so developers can integrate AquaDex swaps and liquidity directly into their applications.",
        status: "future",
        tags: ["SDK", "Developer"],
      },
      {
        title: "Perpetuals (AquaPerp)",
        description: "Leverage trading built on AquaDex liquidity. Up to 10x leverage on major Monad pairs.",
        status: "future",
        tags: ["Perps", "Leverage"],
      },
      {
        title: "Launchpad",
        description: "Fair-launch token listings via AquaDex pools. Projects launch with instant deep liquidity.",
        status: "future",
        tags: ["Launchpad", "IDO"],
      },
    ],
  },
];

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  done:   { label: "Complete",   icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"   },
  active: { label: "In progress",icon: Zap,          color: "#00c8e8", bg: "rgba(0,200,232,0.08)",   border: "rgba(0,200,232,0.25)"  },
  soon:   { label: "Soon",       icon: Clock,        color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  future: { label: "Planned",    icon: Lock,         color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.15)"},
};

const PHASE_STATUS: Record<Status, { dot: string; badge: string; badgeText: string }> = {
  done:   { dot: "bg-green-400",  badge: "bg-green-400/10 border-green-400/20 text-green-400",      badgeText: "Complete"    },
  active: { dot: "bg-[#00c8e8] animate-pulse", badge: "bg-[rgba(0,200,232,0.1)] border-[rgba(0,200,232,0.25)] text-[#00c8e8]", badgeText: "Active" },
  soon:   { dot: "bg-amber-400",  badge: "bg-amber-400/10 border-amber-400/20 text-amber-400",      badgeText: "Upcoming"    },
  future: { dot: "bg-white/20",   badge: "bg-white/5 border-white/10 text-white/30",                badgeText: "Planned"     },
};

export default function RoadmapContent() {
  return (
    <div className="space-y-6">
      {PHASES.map((phase, phaseIdx) => {
        const Icon = phase.icon;
        const ps = PHASE_STATUS[phase.status];
        const completedCount = phase.items.filter(i => i.status === "done").length;

        return (
          <div key={phase.phase} className="glass-card rounded-2xl overflow-hidden">
            {/* Phase header */}
            <div className="px-6 py-5 border-b border-[rgba(0,200,232,0.08)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${phase.color}15`, border: `1px solid ${phase.color}30` }}
                >
                  <Icon size={18} style={{ color: phase.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-white/30">{phase.phase}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${ps.badge}`}
                      style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                      {ps.badgeText}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {phase.title}
                  </h2>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs text-white/30 mb-1">{phase.period}</div>
                <div className="text-xs font-mono text-white/50">
                  {completedCount}/{phase.items.length} done
                </div>
                {/* Progress bar */}
                <div className="w-24 h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(completedCount / phase.items.length) * 100}%`,
                      background: phase.color,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-[rgba(0,200,232,0.05)]">
              {phase.items.map((item, idx) => {
                const sc = STATUS_CONFIG[item.status];
                const StatusIcon = sc.icon;
                return (
                  <div key={idx} className="px-6 py-4 flex gap-4 group hover:bg-[rgba(0,200,232,0.02)] transition-colors">
                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <StatusIcon size={16} style={{ color: sc.color }} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-white"
                          style={{ fontFamily: "var(--font-display)" }}>
                          {item.title}
                        </h3>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-mono"
                          style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed mb-2">
                        {item.description}
                      </p>
                      {item.tags && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Vision footer */}
      <div className="glass-card rounded-2xl p-8 text-center mt-8">
        <Star size={24} className="text-[#00c8e8] mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}>
          The Vision
        </h3>
        <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
          AquaDex aims to become the deepest and most capital-efficient liquidity layer on Monad.
          By combining the simplicity of Classic pools with the precision of Concentrated Liquidity,
          and routing every trade through the optimal path, we&apos;re building infrastructure that the
          entire Monad DeFi ecosystem can rely on.
        </p>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/25">
          <span>Chain ID: 143</span>
          <span>·</span>
          <span>Monad Mainnet</span>
          <span>·</span>
          <span>Flow Deeper on Monad</span>
        </div>
      </div>
    </div>
  );
}
