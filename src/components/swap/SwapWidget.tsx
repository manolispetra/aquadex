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
  const [tokenOut, setTokenOut] = useState<Token>(AQUA_TOKEN); // άλλαξε αν θες
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

  // Contracts
  const { writeContract: doApprove, isPending: approving } = useWriteContract();
  const { writeContract: doSwap, data: swapTxHash, isPending: swapping } = useWriteContract();
  const { isSuccess: swapSuccess } = useWaitForTransactionReceipt({ hash: swapTxHash });

  useEffect(() => { if (swapSuccess) { setAmountIn(""); refetchQuote(); } }, [swapSuccess]);

  // ==================== FIXED handleSwap ====================
  function handleSwap() {
    if (!address || parsedAmountIn === BigInt(0)) {
      console.log("❌ No address or amount");
      return;
    }

    const slippageBps = BigInt(Math.floor(slippage * 100));
    const amountOutMin = bestAmountOut * (BigInt(10000) - slippageBps) / BigInt(10000);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);
    const wmon = CONTRACTS.WMON as `0x${string}`;

    console.log("🔄 Swap started:", { tokenIn: tokenIn.symbol, tokenOut: tokenOut.symbol, isWrap: isWrapOrUnwrap });

    try {
      if (isWrapOrUnwrap) {
        if (nativeIn) {
          // MON → WMON
          doSwap({ address: wmon, abi: ERC20_ABI, functionName: "deposit", value: parsedAmountIn } as any);
        } else {
          // WMON → MON
          doSwap({ address: wmon, abi: ERC20_ABI, functionName: "withdraw", args: [parsedAmountIn] } as any);
        }
        return;
      }

      if (nativeIn && !nativeOut) {
        // MON → Token
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
        // Token → MON
        doSwap({
          address: CONTRACTS.V2_ROUTER as `0x${string}`,
          abi: V2_ROUTER_ABI,
          functionName: "swapExactTokensForETH",
          args: [parsedAmountIn, amountOutMin, [tokenIn.address as `0x${string}`, wmon], address, deadline],
        } as any);
        return;
      }

      // Token → Token (Universal Router) - FIXED arguments
      doSwap({
        address: CONTRACTS.UNIVERSAL_ROUTER as `0x${string}`,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [{
          tokenIn: effectiveIn as `0x${string}`,
          tokenOut: effectiveOut as `0x${string}`,
          recipient: address,
          deadline: deadline,
          amountIn: parsedAmountIn,
          amountOutMinimum: amountOutMin,
          preferredV3Fee: 0,
          forceV2: true,        // ← προσθέσαμε forceV2: true
          forceV3: false,
        }],
      } as any);

    } catch (error) {
      console.error("Swap error:", error);
    }
  }

  function flipTokens() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOutFmt || "");
  }

  const btnLoading = approving || swapping || waitingSwap;

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <div className="glass-card rounded-3xl p-4 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">

        {/* Όλο το UI σου μένει ακριβώς ίδιο μέχρι το button */}

        {/* Action Button - FIXED disabled condition */}
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
            {swapping || waitingSwap 
              ? "Swapping..." 
              : swapSuccess 
                ? "Swap complete!" 
                : "Swap"}
          </button>
        )}
      </div>

      {swapSuccess && swapTxHash && (
        <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center">
          Confirmed! <a href={`https://monadscan.com/tx/${swapTxHash}`} target="_blank" className="underline">View on MonadScan</a>
        </div>
      )}
    </div>
  );
}
