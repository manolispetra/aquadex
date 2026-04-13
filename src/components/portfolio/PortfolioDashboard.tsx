"use client";

import { useAccount, useReadContract, useReadContracts, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "@/lib/contracts";
import { DEFAULT_TOKENS, isNativeToken } from "@/lib/tokens";
import { ERC20_ABI, POSITION_MANAGER_ABI } from "@/lib/abis";
import { Wallet, Droplets, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";

function ConnectPrompt() {
  return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🌊</div>
      <h2 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Connect your wallet</h2>
      <p className="text-sm text-white/40">Connect to view your AquaDex portfolio</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} style={{ color }} />
        <span className="text-xs text-white/40 uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>{label}</span>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

export default function PortfolioDashboard() {
  const { address, isConnected } = useAccount();

  // Native MON balance
  const { data: nativeBalance } = useBalance({ address, query: { enabled: !!address } });

  // ERC-20 balances for non-native tokens
  const erc20Tokens = DEFAULT_TOKENS.filter((t) => !isNativeToken(t));
  const balanceCalls = erc20Tokens.map((t) => ({
    address: t.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf" as const,
    args: [address as `0x${string}`],
  }));
  const { data: erc20Balances } = useReadContracts({ contracts: balanceCalls as any, query: { enabled: !!address } });

  // V3 positions
  const { data: nftCount } = useReadContract({
    address: CONTRACTS.POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  if (!isConnected) return <ConnectPrompt />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Wallet}     label="Tokens"     value={DEFAULT_TOKENS.length.toString()} sub="Default tokens"    color="#00c8e8" />
        <StatCard icon={Droplets}   label="V3 Positions" value={nftCount !== undefined ? nftCount.toString() : "—"} sub="NFT positions" color="#4db8ff" />
        <StatCard icon={TrendingUp} label="Network"    value="Monad"       sub="Chain ID 143"   color="#00c8e8" />
        <StatCard icon={ExternalLink} label="Explorer" value="MonadScan"   sub={address ? address.slice(0,6) + "..." + address.slice(-4) : ""} color="#7c9fff" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Token Balances</h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[rgba(0,200,232,0.08)] grid grid-cols-3 gap-4">
            {["Token", "Balance", "Actions"].map(h => (
              <div key={h} className="text-xs font-semibold text-white/30 uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>{h}</div>
            ))}
          </div>

          {DEFAULT_TOKENS.map((token, i) => {
            let raw: bigint | undefined;
            if (isNativeToken(token)) {
              raw = nativeBalance?.value;
            } else {
              const idx = erc20Tokens.findIndex((t) => t.address === token.address);
              raw = idx >= 0 ? (erc20Balances?.[idx]?.result as bigint | undefined) : undefined;
            }
            const fmt = raw !== undefined ? parseFloat(formatUnits(raw, token.decimals)).toFixed(4) : "—";

            return (
              <div key={token.address} className="pool-row px-5 py-4 grid grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(0,200,232,0.1)] border border-[rgba(0,200,232,0.2)] flex items-center justify-center overflow-hidden">
                    {token.logoURI
                      ? <img src={token.logoURI} alt={token.symbol} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                      : <span className="text-xs font-bold text-[#00c8e8]">{token.symbol.slice(0, 2)}</span>}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-1.5" style={{ fontFamily: "var(--font-display)" }}>
                      {token.symbol}
                      {token.isNative && <span className="text-[9px] px-1 py-0.5 rounded bg-[rgba(0,200,232,0.12)] text-[#00c8e8]">NATIVE</span>}
                    </div>
                    <div className="text-xs text-white/30">{token.name}</div>
                  </div>
                </div>
                <div className="font-mono text-sm text-white/70">{fmt}</div>
                <div className="flex items-center gap-2">
                  <Link href="/swap" className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(0,200,232,0.08)] text-[#00c8e8] hover:bg-[rgba(0,200,232,0.15)] transition-colors">Swap</Link>
                  {!isNativeToken(token) && (
                    <a href={"https://monadscan.com/token/" + token.address} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/50 transition-colors">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-2">
        <a href={"https://monadscan.com/address/" + address} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors">
          <ExternalLink size={11} />
          View {address?.slice(0,6)}...{address?.slice(-4)} on MonadScan
        </a>
      </div>
    </div>
  );
}
