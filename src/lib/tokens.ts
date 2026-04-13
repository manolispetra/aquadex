// ============================================================
// lib/tokens.ts — Token management with custom import support
// ============================================================

export interface Token {
  address: string;   // "NATIVE" for MON native token
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId?: number;
  isNative?: boolean;
  isImported?: boolean;
}

// MON native token — like ETH on Ethereum
// Uses NATIVE as address sentinel value
export const MON_NATIVE: Token = {
  address: "NATIVE",
  symbol: "MON",
  name: "MON (Native)",
  decimals: 18,
  logoURI: "/tokens/mon.svg",
  chainId: 143,
  isNative: true,
};

export const WMON_TOKEN: Token = {
  address: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
  symbol: "WMON",
  name: "Wrapped MON",
  decimals: 18,
  logoURI: "/tokens/wmon.svg",
  chainId: 143,
};

export const AQUA_TOKEN: Token = {
  address: "0x04fA85F25886EeaC5Ac27C038feeD267a927754B",
  symbol: "AQUA",
  name: "AquaDex",
  decimals: 18,
  logoURI: "/logo.svg",
  chainId: 143,
};

export const DEFAULT_TOKENS: Token[] = [
  MON_NATIVE,
  WMON_TOKEN,
  AQUA_TOKEN,
];

// localStorage key for user-imported tokens
const STORAGE_KEY = "aquadex_imported_tokens_v1";

export function getImportedTokens(): Token[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveImportedToken(token: Token): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getImportedTokens();
    const filtered = existing.filter(
      (t) => t.address.toLowerCase() !== token.address.toLowerCase()
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...filtered, { ...token, isImported: true }])
    );
  } catch {}
}

export function removeImportedToken(address: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getImportedTokens();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        existing.filter((t) => t.address.toLowerCase() !== address.toLowerCase())
      )
    );
  } catch {}
}

export function getAllTokens(): Token[] {
  return [...DEFAULT_TOKENS, ...getImportedTokens()];
}

export function isNativeToken(token: Token | undefined): boolean {
  return token?.isNative === true || token?.address === "NATIVE";
}

// When calling contracts, native MON uses WMON address
export function getEffectiveAddress(token: Token): string {
  if (isNativeToken(token)) return WMON_TOKEN.address;
  return token.address;
}

export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
