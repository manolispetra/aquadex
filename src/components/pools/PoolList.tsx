"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS, KNOWN_TOKENS } from "@/lib/contracts";
import { V2_FACTORY_ABI, V2_PAIR_ABI, ERC20_ABI } from "@/lib/abis";
import { formatUnits } from "viem";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";

function PoolSkeleton() {
  return (
    <div className="pool-row px-5 py-4 flex items-center gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="shimmer h-4 rounded flex-1" />
      ))}
    </div>
  );
}

function TokenPairIcon({ symbol0, symbol1 }: { symbol0: string; symbol1: string }) {
  return (
    <div className="flex items-center -space-x-2">
      <div className="w-8 h-8 rounded-full bg-[rgba(0,200,232,0.15)] border-2 border-[#091426] flex items-center justify-center z-10">
        <span className="text-[10px] font-bold text-[#00c8e8]">{symbol0[0]}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-[rgba(77,184,255,0.15)] border-2 border-[#091426] flex items-center justify-center">
        <span className="text-[10px] font-bold text-[#4db8ff]">{symbol1[0]}</span>
      </div>
    </div>
  );
}

export default function PoolList() {
  const { data: pairCount } = useReadContract({
    address: CONTRACTS.V2_FACTORY as `0x${string}`,
    abi: V2_FACTORY_ABI,
    functionName: "allPairsLength",
  });

  const count = pairCount ? Number(pairCount) : 0;
  const indices = Array.from({ length: Math.min(count, 20) }, (_, i) => BigInt(i));

  // Fetch pair addresses
  const pairCalls = indices.map((i) => ({
    address: CONTRACTS.V2_FACTORY as `0x${string}`,
    abi: V2_FACTORY_ABI,
    functionName: "allPairs" as const,
    args: [i],
  }));

  const { data: pairAddresses } = useReadContracts({ contracts: pairCalls as any });

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-3 border-b border-[rgba(0,200,232,0.08)] grid grid-cols-4 gap-4">
        {["Pool", "TVL", "24h Volume", "APR"].map((h) => (
          <div key={h} className="text-xs font-semibold text-white/30 uppercase tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {count === 0 && (
        <div className="py-16 text-center">
          <div className="text-4xl mb-3">🌊</div>
          <div className="text-white/40 text-sm mb-4">No pools yet.</div>
          <Link
            href="/pools/add"
            className="btn-aqua inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus size={14} />
            Create the first pool
          </Link>
        </div>
      )}

      {!pairAddresses && count > 0 && (
        <>
          {[1,2,3].map(i => <PoolSkeleton key={i} />)}
        </>
      )}

      {pairAddresses?.map((result, i) => {
        const pairAddr = result.result as string;
        if (!pairAddr || pairAddr === "0x0000000000000000000000000000000000000000") return null;
        return <PoolRow key={pairAddr} address={pairAddr} index={i} />;
      })}

      {count > 20 && (
        <div className="px-5 py-3 text-xs text-white/30 text-center border-t border-[rgba(0,200,232,0.08)]">
          Showing 20 of {count} pools
        </div>
      )}
    </div>
  );
}

function PoolRow({ address, index }: { address: string; index: number }) {
  const { data: token0 } = useReadContract({
    address: address as `0x${string}`,
    abi: V2_PAIR_ABI,
    functionName: "token0",
  });
  const { data: token1 } = useReadContract({
    address: address as `0x${string}`,
    abi: V2_PAIR_ABI,
    functionName: "token1",
  });
  const { data: reserves } = useReadContract({
    address: address as `0x${string}`,
    abi: V2_PAIR_ABI,
    functionName: "getReserves",
  });
  const { data: sym0 } = useReadContract({
    address: token0 as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!token0 },
  });
  const { data: sym1 } = useReadContract({
    address: token1 as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!token1 },
  });

  const symbol0 = (sym0 as string) || "???";
  const symbol1 = (sym1 as string) || "???";

  const r0 = reserves ? formatUnits((reserves as any)[0], 18) : "0";
  const r1 = reserves ? formatUnits((reserves as any)[1], 18) : "0";
  const tvl = (parseFloat(r0) + parseFloat(r1)).toFixed(2);

  return (
    <div className="pool-row px-5 py-4 grid grid-cols-4 gap-4 items-center group">
      <div className="flex items-center gap-3">
        <TokenPairIcon symbol0={symbol0} symbol1={symbol1} />
        <div>
          <div className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            {symbol0}/{symbol1}
          </div>
          <div className="text-xs text-white/30 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
      </div>
      <div className="text-sm font-mono text-white/70">
        {parseFloat(tvl) > 0 ? `~${parseFloat(tvl).toFixed(2)} LP` : "—"}
      </div>
      <div className="text-sm font-mono text-white/40">—</div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-green-400">—</span>
        <div className="hidden group-hover:flex items-center gap-2">
          <Link
            href={`/pools/add?token0=${token0}&token1=${token1}`}
            className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(0,200,232,0.1)] text-[#00c8e8] hover:bg-[rgba(0,200,232,0.2)] transition-colors"
          >
            + Add
          </Link>
          <a
            href={`https://monadscan.com/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white/60 transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
