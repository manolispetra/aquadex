"use client";

import { useState, useEffect } from "react";
import {
  useAccount, useWriteContract, useReadContract,
  useWaitForTransactionReceipt, useSwitchChain, useBalance,
} from "wagmi";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { Settings, ArrowUpDown, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import TokenSelectModal from "./TokenSelectModal";
import { CONTRACTS } from "@/lib/contracts";
import {
  type Token, MON_NATIVE,
  isNativeToken, getEffectiveAddress,
} from "@/lib/tokens";
import { UNIVERSAL_ROUTER_ABI, V2_ROUTER_ABI, ERC20_ABI } from "@/lib/abis";
import { monad } from "@/lib/wagmi";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];

export default function SwapWidget() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const [tokenIn,  setTokenIn]  = useState<Token>(MON_NATIVE);
  const [tokenOut, setTokenOut] = useState<Token>(MON_NATIVE);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("");

  const wrongNetwork = isConnected && chain?.id !== monad.id;
  const nativeIn  = isNativeToken(tokenIn);
  const nativeOut = isNativeToken(tokenOut);

  const safeParse = (v: string, d: number): bigint => {
    try { return parseUnits(v || "0", d); } catch { return BigInt(0); }
  };

  const parsedAmountIn = safeParse(amountIn, tokenIn.decimals);

  // Balances
  const { data: nativeBalance } = useBalance({ address, query: { enabled: !!address } });

  const { data: erc20BalIn } = useReadContract({
    address: tokenIn.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address && !nativeIn },
  });

  const { data: erc20BalOut } = useReadContract({
    address: tokenOut.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!address && !nativeOut },
  });

  const balInRaw  = nativeIn  ? nativeBalance?.value : (erc20BalIn  as bigint | undefined);
  const balOutRaw = nativeOut ? nativeBalance?.value : (erc20BalOut as bigint | undefined);
  const balInFmt  = balInRaw  !== undefined ? parseFloat(formatUnits(balInRaw,  tokenIn.decimals)).toFixed(4)  : "0.0000";
  const balOutFmt = balOutRaw !== undefined ? parseFloat(formatUnits(balOutRaw, tokenOut.decimals)).toFixed(4) : "0.0000";

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`],
    query: { enabled: !!address && !nativeIn },
  });

  const needsApproval =
    !nativeIn &&
    isConnected &&
    parsedAmountIn > BigInt(0) &&
    allowance !== undefined &&
    (allowance as bigint) < parsedAmountIn;

  // Quote
  const effectiveIn  = getEffectiveAddress(tokenIn);
  const effectiveOut = getEffectiveAddress(tokenOut);
  const isWrapOrUnwrap = effectiveIn.toLowerCase() === effectiveOut.toLowerCase();

  const { data: amountsOutData, isLoading: quoting, refetch: refetchQuote } = useReadContract({
    address: CONTRACTS.V2_ROUTER as `0x${string}`,
    abi: V2_ROUTER_ABI,
    functionName: "getAmountsOut",
    args: isWrapOrUnwrap 
      ? undefined 
      : [parsedAmountIn, [effectiveIn as `0x${string}`, effectiveOut as `0x${string}`]],
    query: {
      enabled: parsedAmountIn > BigInt(0) && !isWrapOrUnwrap,
      refetchInterval: 10000,
    },
  });

  let bestAmountOut: bigint = BigInt(0);
  if (isWrapOrUnwrap) {
    bestAmountOut = parsedAmountIn;
  } else if (amountsOutData && Array.isArray(amountsOutData) && amountsOutData.length >= 2) {
    bestAmountOut = amountsOutData[1] as bigint;
  }

  const amountOutFmt = bestAmountOut > BigInt(0) 
    ? parseFloat(formatUnits(bestAmountOut, tokenOut.decimals)).toFixed(6)
    : "";

  // Write contracts
  const { writeContract: doApprove, isPending: approving } = useWriteContract();
  const { writeContract: doSwap, data: swapTxHash, isPending: swapping } = useWriteContract();
  const { isSuccess: swapSuccess } = useWaitForTransactionReceipt({ hash: swapTxHash });

  useEffect(() => { if (swapSuccess) { setAmountIn(""); refetchQuote(); } }, [swapSuccess]);

  // Handle Approve
  function handleApprove() {
    doApprove({
      address: tokenIn.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`, maxUint256],
    } as any);
  }

  // Handle Swap - Διορθωμένο
  function handleSwap() {
    if (!address || parsedAmountIn === BigInt(0)) return;

    const slippageBps = BigInt(Math.floor(slippage * 100));
    const amountOutMin = bestAmountOut * (BigInt(10000) - slippageBps) / BigInt(10000);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    const wmon = CONTRACTS.WMON as `0x${string}`;

    if (isWrapOrUnwrap) {
      if (nativeIn) {
        doSwap({ address: wmon, abi: ERC20_ABI, functionName: "deposit", value: parsedAmountIn } as any);
      } else {
        doSwap({ address: wmon, abi: ERC20_ABI, functionName: "withdraw", args: [parsedAmountIn] } as any);
      }
      return;
    }

    if (nativeIn && !nativeOut) {
      doSwap({
        address: CONTRACTS.V2_ROUTER as `0x${string}`,
        abi: V2_ROUTER_ABI,
        functionName: "swapExactETHForTokens",
        value: parsedAmountIn,
        args: [amountOutMin, [wmon, tokenOut.address as `0x${string}`], address, deadline],
      } as any);
      return;
    }

    if (!nativeIn && nativeOut) {
      doSwap({
        address: CONTRACTS.V2_ROUTER as `0x${string}`,
        abi: V2_ROUTER_ABI,
        functionName: "swapExactTokensForETH",
        args: [parsedAmountIn, amountOutMin, [tokenIn.address as `0x${string}`, wmon], address, deadline],
      } as any);
      return;
    }

    // Token → Token (με forceV2 για καλύτερη συμβατότητα με custom tokens)
    doSwap({
      address: CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: "exactInputSingle",
      args: [{
        tokenIn: effectiveIn as `0x${string}`,
        tokenOut: effectiveOut as `0x${string}`,
        recipient: address,
        deadline,
        amountIn: parsedAmountIn,
        amountOutMinimum: amountOutMin,
        preferredV3Fee: 0,
        forceV2: true,
        forceV3: false,
      }],
    } as any);
  }

  function flipTokens() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOutFmt || "");
  }

  const btnLoading = approving || swapping;

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <div className="glass-card rounded-3xl p-4 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <button className="tab-btn active">Swap</button>
            <button className="tab-btn" onClick={() => window.location.href = "/pools/add"}>
              Add Liquidity
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => refetchQuote()}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors">
              <RefreshCw size={14} className={quoting ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowSettings(!showSettings)}
              className={clsx("p-1.5 rounded-lg transition-colors",
                showSettings ? "text-[#00c8e8] bg-[rgba(0,200,232,0.1)]" : "text-white/30 hover:text-white/60 hover:bg-white/5")}>
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mb-4 p-3 rounded-2xl bg-[rgba(0,0,0,0.3)] border border-[rgba(0,200,232,0.08)] animate-slide-up">
            <div className="text-xs font-semibold text-white/40 mb-2.5 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-display)" }}>Slippage</div>
            <div className="flex gap-2">
              {SLIPPAGE_OPTIONS.map((s) => (
                <button key={s} onClick={() => { setSlippage(s); setCustomSlippage(""); }}
                  className={clsx("px-3 py-1.5 rounded-lg text-xs font-mono transition-colors",
                    slippage === s && !customSlippage
                      ? "bg-[rgba(0,200,232,0.2)] text-[#00c8e8] border border-[rgba(0,200,232,0.3)]"
                      : "bg-white/5 text-white/50 hover:bg-white/8")}>
                  {s}%
                </button>
              ))}
              <div className="relative flex-1">
                <input type="number" placeholder="Custom" value={customSlippage}
                  onChange={(e) => { setCustomSlippage(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0 && v < 50) setSlippage(v); }}
                  className="w-full px-2 py-1.5 pr-6 rounded-lg text-xs text-right bg-[rgba(0,0,0,0.4)] border border-[rgba(0,200,232,0.1)] text-white outline-none font-mono" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/30">%</span>
              </div>
            </div>
            {slippage > 5 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
                <AlertTriangle size={11} /> High slippage — risk of front-running
              </div>
            )}
          </div>
        )}

        {/* Token In */}
        <div className="rounded-2xl bg-[rgba(0,0,0,0.38)] border border-[rgba(255,255,255,0.05)] p-3 mb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">You pay</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-white/30">Bal: {balInFmt}</span>
              {balInRaw && balInRaw > BigInt(0) && (
                <button
                  onClick={() => setAmountIn(parseFloat(formatUnits(balInRaw, tokenIn.decimals)).toFixed(6))}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(0,200,232,0.1)] text-[#00c8e8] hover:bg-[rgba(0,200,232,0.2)] transition-colors">
                  MAX
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" placeholder="0.0" value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 bg-transparent text-[26px] font-mono text-white placeholder-white/20 outline-none min-w-0" />
            <TokenSelectModal selected={tokenIn} onSelect={setTokenIn} exclude={tokenOut.address} />
          </div>
        </div>

        {/* Flip */}
        <div className="flex justify-center -my-1 relative z-10">
          <button onClick={flipTokens}
            className="w-9 h-9 rounded-xl bg-[#091426] border-2 border-[rgba(0,200,232,0.15)] flex items-center justify-center text-white/30 hover:text-[#00c8e8] hover:border-[rgba(0,200,232,0.4)] transition-all hover:rotate-180 duration-300">
            <ArrowUpDown size={14} />
          </button>
        </div>

        {/* Token Out */}
        <div className="rounded-2xl bg-[rgba(0,0,0,0.38)] border border-[rgba(255,255,255,0.05)] p-3 mt-1 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">You receive</span>
            <span className="text-xs font-mono text-white/30">Bal: {balOutFmt}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-[26px] font-mono text-white">
              {quoting && parsedAmountIn > BigInt(0)
                ? <span className="text-white/30 text-xl">Loading...</span>
                : amountOutFmt || "0.0"}
            </div>
            <TokenSelectModal selected={tokenOut} onSelect={setTokenOut} exclude={tokenIn.address} />
          </div>
        </div>

        {/* Warning για custom tokens χωρίς liquidity */}
        {parsedAmountIn > BigInt(0) && bestAmountOut === BigInt(0) && !isWrapOrUnwrap && !quoting && (
          <div className="mb-4 p-3 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-amber-400/30 text-amber-400 text-sm flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              No liquidity found for {tokenIn.symbol} → {tokenOut.symbol}.<br />
              Try adding liquidity first or choose another pair.
            </div>
          </div>
        )}

        {/* Route info */}
        {bestAmountOut > BigInt(0) && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-[rgba(0,200,232,0.03)] border border-[rgba(0,200,232,0.08)] text-xs space-y-1.5">
            <div className="flex justify-between text-white/40">
              <span>Route</span>
              <span className="flex items-center gap-1.5 text-[#00c8e8]">
                <Zap size={10} />
                {nativeIn || nativeOut ? "Classic V2 (MON)" : "Classic V2"}
              </span>
            </div>
            <div className="flex justify-between text-white/40">
              <span>Min. received</span>
              <span className="font-mono text-white/60">
                {parseFloat(formatUnits(
                  bestAmountOut * (BigInt(10000) - BigInt(Math.floor(slippage * 100))) / BigInt(10000),
                  tokenOut.decimals
                )).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between text-white/40">
              <span>Fee</span>
              <span>0.25%</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {wrongNetwork ? (
          <button onClick={() => switchChain({ chainId: monad.id })}
            className="btn-aqua w-full py-4 rounded-2xl text-base">
            Switch to Monad
          </button>
        ) : !isConnected ? (
          <div className="w-full py-4 rounded-2xl text-sm text-center text-white/30 border border-white/8 bg-white/5 cursor-not-allowed">
            Connect wallet to swap
          </div>
        ) : needsApproval ? (
          <button onClick={handleApprove} disabled={btnLoading}
            className="btn-aqua w-full py-4 rounded-2xl text-base disabled:opacity-50">
            {approving ? "Approving..." : `Approve ${tokenIn.symbol}`}
          </button>
        ) : (
          <button 
            onClick={handleSwap}
            disabled={btnLoading || parsedAmountIn === BigInt(0)}
            className="btn-aqua w-full py-4 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {swapping 
              ? <span className="flex items-center justify-center gap-2"><RefreshCw size={15} className="animate-spin" />Swapping...</span>
              : swapSuccess ? "Swap complete!" : "Swap"}
          </button>
        )}
      </div>

      {/* Tx success */}
      {swapSuccess && swapTxHash && (
        <div className="mt-3 p-3 rounded-xl bg-[rgba(0,200,100,0.08)] border border-[rgba(0,200,100,0.15)] text-sm text-green-400 text-center">
          Confirmed!{" "}
          <a href={"https://monadscan.com/tx/" + swapTxHash} target="_blank" rel="noopener noreferrer"
            className="underline hover:text-green-300">
            View on MonadScan
          </a>
        </div>
      )}
    </div>
  );
}
