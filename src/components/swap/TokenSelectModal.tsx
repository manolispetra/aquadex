"use client";

import { useState, useEffect } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { KNOWN_TOKENS, type Token, CONTRACTS } from "@/lib/contracts";
import { ERC20_ABI } from "@/lib/abis";
import { formatUnits } from "viem";
import Image from "next/image";
import { clsx } from "clsx";

interface Props {
  selected?: Token;
  onSelect: (token: Token) => void;
  exclude?: string;
}

function TokenRow({ token, balance, onClick }: { token: Token; balance?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[rgba(0,200,232,0.06)] transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[rgba(0,200,232,0.1)] border border-[rgba(0,200,232,0.2)] flex items-center justify-center overflow-hidden">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-[#00c8e8]">{token.symbol[0]}</span>
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-white group-hover:text-[#00c8e8] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}>
            {token.symbol}
          </div>
          <div className="text-xs text-white/40">{token.name}</div>
        </div>
      </div>
      {balance && (
        <div className="text-right">
          <div className="text-sm font-mono text-white/70">{balance}</div>
        </div>
      )}
    </button>
  );
}

export default function TokenSelectModal({ selected, onSelect, exclude }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { address } = useAccount();

  const filteredTokens = KNOWN_TOKENS.filter(
    (t) =>
      t.address.toLowerCase() !== exclude?.toLowerCase() &&
      (t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="token-badge flex items-center gap-2 px-3 py-2 rounded-xl min-w-[120px]"
      >
        {selected ? (
          <>
            <div className="w-5 h-5 rounded-full bg-[rgba(0,200,232,0.15)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {selected.logoURI ? (
                <img src={selected.logoURI} alt={selected.symbol} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-[#00c8e8]">{selected.symbol[0]}</span>
              )}
            </div>
            <span className="font-semibold text-sm text-white" style={{ fontFamily: "var(--font-display)" }}>
              {selected.symbol}
            </span>
          </>
        ) : (
          <span className="text-sm text-white/50">Select token</span>
        )}
        <ChevronDown size={14} className="text-white/40 ml-auto" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm glass-card rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(0,200,232,0.08)]">
              <h3 className="font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Select token
              </h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[rgba(0,200,232,0.08)]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search by name or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="aqua-input w-full pl-8 pr-3 py-2.5 rounded-xl text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Token list */}
            <div className="p-2 max-h-72 overflow-y-auto">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <TokenRow
                    key={token.address}
                    token={token}
                    onClick={() => { onSelect(token); setOpen(false); setSearch(""); }}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-white/30 text-sm">
                  No tokens found
                </div>
              )}
            </div>

            {/* Footer note */}
            <div className="p-3 text-xs text-white/25 text-center border-t border-[rgba(0,200,232,0.08)]">
              Only showing verified AquaDex tokens
            </div>
          </div>
        </div>
      )}
    </>
  );
}
