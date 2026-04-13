"use client";

import { useState, useEffect, useRef } from "react";
import { usePublicClient } from "wagmi";
import { X, Search, ChevronDown, AlertTriangle, Plus, Trash2 } from "lucide-react";
import {
  getAllTokens, saveImportedToken, removeImportedToken,
  isValidAddress, isNativeToken, type Token,
} from "@/lib/tokens";
import { ERC20_LOOKUP_ABI } from "@/lib/abis";
import { clsx } from "clsx";

interface Props {
  selected?: Token;
  onSelect: (token: Token) => void;
  exclude?: string;
}

function TokenLogo({ token, size = 28 }: { token: Token; size?: number }) {
  const [err, setErr] = useState(false);
  if (token.logoURI && !err) {
    return (
      <img
        src={token.logoURI}
        alt={token.symbol}
        width={size} height={size}
        className="rounded-full object-cover"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-[#00c8e8] bg-[rgba(0,200,232,0.12)] border border-[rgba(0,200,232,0.2)]"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {token.symbol.slice(0, 2)}
    </div>
  );
}

function TokenRow({
  token,
  onClick,
  onRemove,
}: {
  token: Token;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center group">
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[rgba(0,200,232,0.06)] transition-colors text-left"
      >
        <TokenLogo token={token} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white truncate"
              style={{ fontFamily: "var(--font-display)" }}>
              {token.symbol}
            </span>
            {token.isNative && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(0,200,232,0.15)] text-[#00c8e8] border border-[rgba(0,200,232,0.2)] flex-shrink-0">
                NATIVE
              </span>
            )}
            {token.isImported && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(245,158,11,0.12)] text-amber-400 border border-[rgba(245,158,11,0.2)] flex-shrink-0">
                IMPORTED
              </span>
            )}
          </div>
          <div className="text-xs text-white/35 truncate">{token.name}</div>
        </div>
        {!token.isNative && (
          <span className="text-[10px] font-mono text-white/20 flex-shrink-0 hidden group-hover:block">
            {token.address.slice(0, 6)}...{token.address.slice(-4)}
          </span>
        )}
      </button>
      {token.isImported && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2 text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
          title="Remove token"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

export default function TokenSelectModal({ selected, onSelect, exclude }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [lookupState, setLookupState] = useState<
    "idle" | "loading" | "found" | "error"
  >("idle");
  const [lookedUp, setLookedUp] = useState<Token | null>(null);
  const [importConfirm, setImportConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const publicClient = usePublicClient();

  // Load tokens (including localStorage imports) whenever modal opens
  useEffect(() => {
    if (open) {
      setTokens(getAllTokens());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
      setLookupState("idle");
      setLookedUp(null);
      setImportConfirm(false);
    }
  }, [open]);

  // On-chain lookup when user pastes a valid address
  useEffect(() => {
    if (!isValidAddress(search)) {
      setLookupState("idle");
      setLookedUp(null);
      setImportConfirm(false);
      return;
    }

    const alreadyKnown = tokens.find(
      (t) => t.address.toLowerCase() === search.toLowerCase()
    );
    if (alreadyKnown) {
      setLookupState("idle");
      return;
    }

    setLookupState("loading");
    setLookedUp(null);

    async function lookup() {
      try {
        if (!publicClient) throw new Error("no client");
        const addr = search as `0x${string}`;

        const [name, symbol, decimals] = await Promise.all([
          publicClient.readContract({
            address: addr,
            abi: ERC20_LOOKUP_ABI,
            functionName: "name",
          } as const),

          publicClient.readContract({
            address: addr,
            abi: ERC20_LOOKUP_ABI,
            functionName: "symbol",
          } as const),

          publicClient.readContract({
            address: addr,
            abi: ERC20_LOOKUP_ABI,
            functionName: "decimals",
          } as const),
        ]);

        setLookedUp({
          address: search,
          name: name as string,
          symbol: symbol as string,
          decimals: Number(decimals),
          chainId: 143,
          isImported: true,
        });
        setLookupState("found");
      } catch {
        setLookupState("error");
      }
    }

    const timer = setTimeout(lookup, 400);
    return () => clearTimeout(timer);
  }, [search, tokens, publicClient]);

  function handleImport() {
    if (!lookedUp) return;
    saveImportedToken(lookedUp);
    setTokens(getAllTokens());
    onSelect(lookedUp);
    setOpen(false);
  }

  function handleRemove(address: string) {
    removeImportedToken(address);
    setTokens(getAllTokens());
  }

  const filtered = tokens.filter((t) => {
    if (t.address.toLowerCase() === (exclude || "").toLowerCase()) return false;
    const q = search.toLowerCase();
    if (isValidAddress(search)) return t.address.toLowerCase() === q;
    return (
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(9,20,38,0.95)] border border-[rgba(0,200,232,0.15)] hover:border-[rgba(0,200,232,0.35)] transition-all min-w-[110px] flex-shrink-0"
      >
        {selected ? (
          <>
            <TokenLogo token={selected} size={20} />
            <span className="font-semibold text-sm text-white" style={{ fontFamily: "var(--font-display)" }}>
              {selected.symbol}
            </span>
          </>
        ) : (
          <span className="text-sm text-white/40">Select</span>
        )}
        <ChevronDown size={13} className="text-white/30 ml-auto flex-shrink-0" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-[#091426] border border-[rgba(0,200,232,0.12)] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-slide-up overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgba(0,200,232,0.08)]">
              <h3 className="font-semibold text-white text-base"
                style={{ fontFamily: "var(--font-display)" }}>
                Select token
              </h3>
              <button onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white transition-colors p-1">
                <X size={17} />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 py-3 border-b border-[rgba(0,200,232,0.06)]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search name, symbol or paste address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,200,232,0.1)] focus:border-[rgba(0,200,232,0.35)] rounded-xl text-sm text-white placeholder-white/25 outline-none transition-colors font-mono"
                />
                {lookupState === "loading" && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3.5 h-3.5 border-2 border-[#00c8e8] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* On-chain lookup result */}
            {lookupState === "found" && lookedUp && !importConfirm && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-400 font-semibold">Unknown token — verify before importing</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{lookedUp.symbol}</div>
                    <div className="text-xs text-white/40">{lookedUp.name}</div>
                    <div className="text-[10px] font-mono text-white/25 mt-0.5">
                      {lookedUp.address.slice(0, 10)}...{lookedUp.address.slice(-8)}
                    </div>
                  </div>
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,200,232,0.1)] text-[#00c8e8] border border-[rgba(0,200,232,0.2)] hover:bg-[rgba(0,200,232,0.2)] transition-colors text-xs font-semibold"
                  >
                    <Plus size={12} />
                    Import
                  </button>
                </div>
              </div>
            )}

            {lookupState === "error" && isValidAddress(search) && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle size={12} />
                Contract not found on Monad Mainnet
              </div>
            )}

            {/* Token list */}
            <div className="py-2 max-h-64 overflow-y-auto px-2">
              {filtered.length > 0 ? (
                <>
                  {/* Native MON always first if not excluded */}
                  {filtered.filter(isNativeToken).map((t) => (
                    <TokenRow
                      key="native"
                      token={t}
                      onClick={() => { onSelect(t); setOpen(false); }}
                    />
                  ))}
                  {/* Divider if native token shown */}
                  {filtered.some(isNativeToken) && filtered.some((t) => !isNativeToken(t)) && (
                    <div className="mx-3 my-1 border-t border-[rgba(0,200,232,0.06)]" />
                  )}
                  {/* ERC-20 tokens */}
                  {filtered.filter((t) => !isNativeToken(t)).map((t) => (
                    <TokenRow
                      key={t.address}
                      token={t}
                      onClick={() => { onSelect(t); setOpen(false); }}
                      onRemove={t.isImported ? () => handleRemove(t.address) : undefined}
                    />
                  ))}
                </>
              ) : lookupState === "idle" || lookupState === "error" ? (
                <div className="py-8 text-center text-white/25 text-sm">
                  {search ? "No tokens found" : "No tokens available"}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[rgba(0,200,232,0.06)] flex items-center justify-between">
              <span className="text-[11px] text-white/20">
                {tokens.filter((t) => !isNativeToken(t)).length} tokens · Monad chain 143
              </span>
              <span className="text-[11px] text-white/20">
                Paste any address to import
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
