"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { Settings, ArrowUpDown, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import TokenSelectModal from "./TokenSelectModal";
import { CONTRACTS, KNOWN_TOKENS, type Token } from "@/lib/contracts";
import { UNIVERSAL_ROUTER_ABI, ERC20_ABI } from "@/lib/abis";
import { monad } from "@/lib/wagmi";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];
const DEFAULT_SLIPPAGE = 0.5;

export default function SwapWidget() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const [tokenIn,  setTokenIn]  = useState<Token | undefined>(KNOWN_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token | undefined>(KNOWN_TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [showSettings, setShowSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("");

  const wrongNetwork = isConnected && chain?.id !== monad.id;

  const safeParse = (amount: string, decimals: number): bigint => {
    try { return parseUnits(amount, decimals); } catch { return BigInt(0); }
  };

  const parsedAmountIn = tokenIn && amountIn ? safeParse(amountIn, tokenIn.decimals) : BigInt(0);

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`],
    query: { enabled: !!address && !!tokenIn },
  });

  // Balances
  const { data: balanceIn } = useReadContract({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address && !!tokenIn },
  });

  const { data: balanceOut } = useReadContract({
    address: tokenOut?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address && !!tokenOut },
  });

  // Quote
  const { data: quoteData, isLoading: quoting, refetch: refetchQuote } = useReadContract({
    address: CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`,
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: "quoteBest",
    args: [
      tokenIn?.address  as `0x${string}`,
      tokenOut?.address as `0x${string}`,
      parsedAmountIn,
    ],
    query: {
      enabled: !!tokenIn && !!tokenOut && parsedAmountIn > BigInt(0),
      refetchInterval: 10000,
    },
  });

  const bestAmountOut: bigint = quoteData ? (quoteData as any)[0] as bigint : BigInt(0);
  const bestPool: number     = quoteData ? (quoteData as any)[1] as number : 0;

  const amountOutFormatted = tokenOut && bestAmountOut > BigInt(0)
    ? parseFloat(formatUnits(bestAmountOut, tokenOut.decimals)).toFixed(6)
    : "";

  // Approve
  const { writeContract: doApprove, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isLoading: waitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });
  useEffect(() => { if (approveSuccess) refetchAllowance(); }, [approveSuccess]);

  const needsApproval =
    isConnected &&
    !!tokenIn &&
    parsedAmountIn > BigInt(0) &&
    allowance !== undefined &&
    (allowance as bigint) < parsedAmountIn;

  function handleApprove() {
    if (!tokenIn) return;
    doApprove({
      address: tokenIn.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`, maxUint256],
    } as any);
  }

  // Swap
  const { writeContract: doSwap, data: swapTxHash, isPending: swapping } = useWriteContract();
  const { isLoading: waitingSwap, isSuccess: swapSuccess } = useWaitForTransactionReceipt({ hash: swapTxHash });

  useEffect(() => {
    if (swapSuccess) { setAmountIn(""); refetchQuote(); }
  }, [swapSuccess]);

  function handleSwap() {
    if (!tokenIn || !tokenOut || !address || parsedAmountIn === BigInt(0) || bestAmountOut === BigInt(0)) return;
    const slippageBps = BigInt(Math.floor(slippage * 100));
    const amountOutMin = bestAmountOut * (BigInt(10000) - slippageBps) / BigInt(10000);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);

    doSwap({
      address: CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: "exactInputSingle",
      args: [{
        tokenIn:          tokenIn.address  as `0x${string}`,
        tokenOut:         tokenOut.address as `0x${string}`,
        recipient:        address,
        deadline,
        amountIn:         parsedAmountIn,
        amountOutMinimum: amountOutMin,
        preferredV3Fee:   0,
        forceV2:          false,
        forceV3:          false,
      }],
    } as any);
  }

  function flipTokens() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOutFormatted || "");
  }

  const balInFormatted  = balanceIn  && tokenIn  ? parseFloat(formatUnits(balanceIn  as bigint, tokenIn.decimals)).toFixed(4)  : "0.0000";
  const balOutFormatted = balanceOut && tokenOut ? parseFloat(formatUnits(balanceOut as bigint, tokenOut.decimals)).toFixed(4) : "0.0000";
  const btnLoading = approving || waitingApprove || swapping || waitingSwap;

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <div className="glass-card rounded-3xl p-4 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button className="tab-btn active">Swap</button>
            <button className="tab-btn" onClick={() => window.location.href = "/pools/add"}>Add Liquidity</button>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => refetchQuote()}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors">
              <RefreshCw size={14} className={quoting ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowSettings(!showSettings)}
              className={clsx("p-1.5 rounded-lg transition-colors",
                showSettings ? "text-[#00c8e8] bg-[rgba(0,200,232,0.1)]" : "text-white/30 hover:text-white/70 hover:bg-white/5")}>
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="mb-4 p-3 rounded-2xl bg-[rgba(0,0,0,0.3)] border border-[rgba(0,200,232,0.08)] animate-slide-up">
            <div className="text-xs font-semibold text-white/50 mb-2.5" style={{ fontFamily: "var(--font-display)" }}>
              Slippage tolerance
            </div>
            <div className="flex items-center gap-2">
              {SLIPPAGE_OPTIONS.map((s) => (
                <button key={s} onClick={() => { setSlippage(s); setCustomSlippage(""); }}
                  className={clsx("px-3 py-1.5 rounded-lg text-xs font-mono transition-colors",
                    slippage === s && !customSlippage
                      ? "bg-[rgba(0,200,232,0.2)] text-[#00c8e8] border border-[rgba(0,200,232,0.3)]"
                      : "bg-white/5 text-white/50 hover:bg-white/10")}>
                  {s}%
                </button>
              ))}
              <div className="relative flex-1">
                <input type="number" placeholder="Custom" value={customSlippage}
                  onChange={(e) => {
                    setCustomSlippage(e.target.value);
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0 && v < 50) setSlippage(v);
                  }}
                  className="aqua-input w-full px-2 py-1.5 rounded-lg text-xs text-right pr-6" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/30">%</span>
              </div>
            </div>
            {slippage > 5 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-400/80">
                <AlertTriangle size={12} />
                High slippage — your transaction may be front-run
              </div>
            )}
          </div>
        )}

        {/* Token In */}
        <div className="rounded-2xl bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.05)] p-3 mb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">You pay</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/30 font-mono">Balance: {balInFormatted}</span>
              {balanceIn && (balanceIn as bigint) > BigInt(0) && (
                <button onClick={() => tokenIn && setAmountIn(
                    parseFloat(formatUnits(balanceIn as bigint, tokenIn.decimals)).toFixed(6)
                  )}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(0,200,232,0.1)] text-[#00c8e8] hover:bg-[rgba(0,200,232,0.2)] transition-colors">
                  MAX
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" placeholder="0.0" value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 bg-transparent text-2xl font-mono text-white placeholder-white/20 outline-none min-w-0" />
            <TokenSelectModal selected={tokenIn} onSelect={setTokenIn} exclude={tokenOut?.address} />
          </div>
        </div>

        {/* Flip */}
        <div className="flex justify-center -my-1 relative z-10">
          <button onClick={flipTokens}
            className="w-9 h-9 rounded-xl bg-[#091426] border-2 border-[rgba(0,200,232,0.15)] flex items-center justify-center text-white/40 hover:text-[#00c8e8] hover:border-[rgba(0,200,232,0.4)] transition-all hover:rotate-180 duration-300">
            <ArrowUpDown size={14} />
          </button>
        </div>

        {/* Token Out */}
        <div className="rounded-2xl bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.05)] p-3 mt-1 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">You receive</span>
            <span className="text-xs text-white/30 font-mono">Balance: {balOutFormatted}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={clsx("flex-1 text-2xl font-mono", quoting && parsedAmountIn > BigInt(0) ? "text-white/30" : "text-white")}>
              {quoting && parsedAmountIn > BigInt(0) ? "..." : (amountOutFormatted || "0.0")}
            </div>
            <TokenSelectModal selected={tokenOut} onSelect={setTokenOut} exclude={tokenIn?.address} />
          </div>
        </div>

        {/* Route info */}
        {bestAmountOut > BigInt(0) && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-[rgba(0,200,232,0.04)] border border-[rgba(0,200,232,0.08)] text-xs space-y-1.5">
            <div className="flex justify-between text-white/50">
              <span>Route</span>
              <span className="flex items-center gap-1.5">
                <Zap size={10} className="text-[#00c8e8]" />
                <span className="text-[#00c8e8]">{bestPool === 0 ? "Classic Pool (V2)" : "Concentrated (V3)"}</span>
              </span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Min. received</span>
              <span className="font-mono text-white/70">
                {tokenOut && bestAmountOut > BigInt(0)
                  ? parseFloat(formatUnits(
                      bestAmountOut * (BigInt(10000) - BigInt(Math.floor(slippage * 100))) / BigInt(10000),
                      tokenOut.decimals
                    )).toFixed(6)
                  : "—"
                } {tokenOut?.symbol}
              </span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Fee</span><span>0.25%</span>
            </div>
          </div>
        )}

        {/* Action button */}
        {wrongNetwork ? (
          <button onClick={() => switchChain({ chainId: monad.id })}
            className="btn-aqua w-full py-4 rounded-2xl text-base">
            Switch to Monad
          </button>
        ) : !isConnected ? (
          <div className="w-full py-4 rounded-2xl text-base text-center text-white/30 border border-[rgba(255,255,255,0.08)] bg-white/5 cursor-not-allowed">
            Connect wallet to swap
          </div>
        ) : needsApproval ? (
          <button onClick={handleApprove} disabled={btnLoading}
            className="btn-aqua w-full py-4 rounded-2xl text-base disabled:opacity-50">
            {approving || waitingApprove
              ? <span className="flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" />Approving...</span>
              : "Approve " + tokenIn?.symbol}
          </button>
        ) : (
          <button onClick={handleSwap}
            disabled={btnLoading || parsedAmountIn === BigInt(0) || bestAmountOut === BigInt(0)}
            className="btn-aqua w-full py-4 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed">
            {swapping || waitingSwap
              ? <span className="flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" />Swapping...</span>
              : swapSuccess ? "Swap complete!" : parsedAmountIn === BigInt(0) ? "Enter an amount" : "Swap"}
          </button>
        )}
      </div>

      {swapSuccess && swapTxHash && (
        <div className="mt-3 p-3 rounded-xl bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.2)] text-sm text-green-400 text-center animate-fade-in">
          Transaction confirmed!{" "}
          <a href={"https://monadscan.com/tx/" + swapTxHash} target="_blank" rel="noopener noreferrer"
            className="underline hover:text-green-300">
            View on MonadScan
          </a>
        </div>
      )}
    </div>
  );
}
