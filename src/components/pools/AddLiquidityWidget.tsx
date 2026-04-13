"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, maxUint256 } from "viem";
import { Plus, RefreshCw, Info } from "lucide-react";
import TokenSelectModal from "@/components/swap/TokenSelectModal";
import { CONTRACTS } from "@/lib/contracts";
import { DEFAULT_TOKENS, isNativeToken, getEffectiveAddress, type Token } from "@/lib/tokens";
import { V2_ROUTER_ABI, ERC20_ABI } from "@/lib/abis";
import { clsx } from "clsx";

export default function AddLiquidityWidget() {
  const { address, isConnected } = useAccount();

  const [tokenA, setTokenA] = useState<Token>(DEFAULT_TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(DEFAULT_TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [poolType, setPoolType] = useState<"v2" | "v3">("v2");

  const routerAddress = CONTRACTS.V2_ROUTER as `0x${string}`;

  const safeParse = (v: string, d: number): bigint => {
    try { return parseUnits(v, d); } catch { return BigInt(0); }
  };

  const parsedA = amountA ? safeParse(amountA, tokenA.decimals) : BigInt(0);
  const parsedB = amountB ? safeParse(amountB, tokenB.decimals) : BigInt(0);

  const nativeA = isNativeToken(tokenA);
  const nativeB = isNativeToken(tokenB);

  const { data: allowanceA, refetch: refetchA } = useReadContract({
    address: tokenA.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, routerAddress],
    query: { enabled: !!address && !nativeA },
  });

  const { data: allowanceB, refetch: refetchB } = useReadContract({
    address: tokenB.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, routerAddress],
    query: { enabled: !!address && !nativeB },
  });

  const needsApproveA = !nativeA && isConnected && parsedA > BigInt(0) && allowanceA !== undefined && (allowanceA as bigint) < parsedA;
  const needsApproveB = !nativeB && isConnected && parsedB > BigInt(0) && allowanceB !== undefined && (allowanceB as bigint) < parsedB;

  const { writeContract: approveA, data: approveTxA, isPending: approvingA } = useWriteContract();
  const { isSuccess: approvedA } = useWaitForTransactionReceipt({ hash: approveTxA });
  if (approvedA) refetchA();

  const { writeContract: approveB, data: approveTxB, isPending: approvingB } = useWriteContract();
  const { isSuccess: approvedB } = useWaitForTransactionReceipt({ hash: approveTxB });
  if (approvedB) refetchB();

  const { writeContract: addLiq, data: addTxHash, isPending: adding } = useWriteContract();
  const { isLoading: waitingAdd, isSuccess: addSuccess } = useWaitForTransactionReceipt({ hash: addTxHash });

  function handleApproveA() {
    approveA({ address: tokenA.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [routerAddress, maxUint256] } as any);
  }

  function handleApproveB() {
    approveB({ address: tokenB.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [routerAddress, maxUint256] } as any);
  }

  function handleAddLiquidity() {
    if (!address || parsedA === BigInt(0) || parsedB === BigInt(0)) return;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    const minA = parsedA * BigInt(95) / BigInt(100);
    const minB = parsedB * BigInt(95) / BigInt(100);

    // MON + Token → addLiquidityETH
    if (nativeA || nativeB) {
      const [tokenErc, amountToken, minToken, amountMon, minMon] = nativeA
        ? [tokenB, parsedB, minB, parsedA, minA]
        : [tokenA, parsedA, minA, parsedB, minB];
      addLiq({
        address: routerAddress,
        abi: V2_ROUTER_ABI,
        functionName: "addLiquidityETH",
        value: amountMon,
        args: [tokenErc.address as `0x${string}`, amountToken, minToken, minMon, address, deadline],
      } as any);
      return;
    }

    addLiq({
      address: routerAddress,
      abi: V2_ROUTER_ABI,
      functionName: "addLiquidity",
      args: [
        getEffectiveAddress(tokenA) as `0x${string}`,
        getEffectiveAddress(tokenB) as `0x${string}`,
        parsedA, parsedB, minA, minB, address, deadline,
      ],
    } as any);
  }

  const loading = approvingA || approvingB || adding || waitingAdd;

  return (
    <div className="glass-card rounded-3xl p-5 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[rgba(0,0,0,0.3)] mb-5">
        {(["v2", "v3"] as const).map((t) => (
          <button key={t} onClick={() => setPoolType(t)}
            className={clsx("flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              poolType === t
                ? "bg-[rgba(0,200,232,0.15)] text-[#00c8e8] border border-[rgba(0,200,232,0.25)]"
                : "text-white/40 hover:text-white/60")}
            style={{ fontFamily: "var(--font-display)" }}>
            {t === "v2" ? "Classic Pool" : "Concentrated (V3)"}
          </button>
        ))}
      </div>

      {poolType === "v3" && (
        <div className="mb-4 p-3 rounded-xl bg-[rgba(0,200,232,0.04)] border border-[rgba(0,200,232,0.1)] text-xs text-[#00c8e8]/70 flex gap-2">
          <Info size={13} className="flex-shrink-0 mt-0.5" />
          <span>V3 concentrated positions require a price range. Use the Position Manager for full control.</span>
        </div>
      )}

      <div className="rounded-2xl bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.05)] p-3 mb-2">
        <div className="text-xs text-white/30 mb-2">Token A</div>
        <div className="flex items-center gap-3">
          <input type="number" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)}
            className="flex-1 bg-transparent text-2xl font-mono text-white placeholder-white/20 outline-none min-w-0" />
          <TokenSelectModal selected={tokenA} onSelect={setTokenA} exclude={tokenB.address} />
        </div>
      </div>

      <div className="flex justify-center -my-0.5 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-[#091426] border border-[rgba(0,200,232,0.15)] flex items-center justify-center text-[#00c8e8]/40">
          <Plus size={14} />
        </div>
      </div>

      <div className="rounded-2xl bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.05)] p-3 mt-2 mb-4">
        <div className="text-xs text-white/30 mb-2">Token B</div>
        <div className="flex items-center gap-3">
          <input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)}
            className="flex-1 bg-transparent text-2xl font-mono text-white placeholder-white/20 outline-none min-w-0" />
          <TokenSelectModal selected={tokenB} onSelect={setTokenB} exclude={tokenA.address} />
        </div>
      </div>

      {parsedA > BigInt(0) && parsedB > BigInt(0) && (
        <div className="mb-4 p-3 rounded-xl bg-[rgba(0,200,232,0.04)] border border-[rgba(0,200,232,0.08)] text-xs space-y-1.5">
          <div className="flex justify-between text-white/50"><span>Pool fee</span><span>0.25%</span></div>
          <div className="flex justify-between text-white/50"><span>Protocol cut</span><span>0.04%</span></div>
          <div className="flex justify-between text-white/50"><span>LP earnings</span><span className="text-green-400">0.21% per swap</span></div>
        </div>
      )}

      {!isConnected ? (
        <div className="w-full py-4 rounded-2xl text-sm text-center text-white/30 border border-white/8 bg-white/5 cursor-not-allowed">Connect wallet</div>
      ) : needsApproveA ? (
        <button onClick={handleApproveA} disabled={loading} className="btn-aqua w-full py-4 rounded-2xl text-sm disabled:opacity-50">
          {approvingA ? <span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin" />Approving...</span> : "Approve " + tokenA.symbol}
        </button>
      ) : needsApproveB ? (
        <button onClick={handleApproveB} disabled={loading} className="btn-aqua w-full py-4 rounded-2xl text-sm disabled:opacity-50">
          {approvingB ? <span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin" />Approving...</span> : "Approve " + tokenB.symbol}
        </button>
      ) : (
        <button onClick={handleAddLiquidity} disabled={loading || parsedA === BigInt(0) || parsedB === BigInt(0)}
          className="btn-aqua w-full py-4 rounded-2xl text-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {adding || waitingAdd
            ? <span className="flex items-center justify-center gap-2"><RefreshCw size={14} className="animate-spin" />Adding liquidity...</span>
            : addSuccess ? "Liquidity added!" : "Add Liquidity"}
        </button>
      )}

      {addSuccess && addTxHash && (
        <div className="mt-3 text-xs text-green-400 text-center">
          <a href={"https://monadscan.com/tx/" + addTxHash} target="_blank" rel="noopener noreferrer" className="underline">View on MonadScan</a>
        </div>
      )}
    </div>
  );
}
