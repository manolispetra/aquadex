// ============================================================
// lib/contracts.ts — AquaDex contract addresses (Monad Mainnet)
// ============================================================

export const CONTRACTS = {
  WMON:                       "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
  V2_FACTORY:                 "0xF76df967c9FF089F577A8dbD89F4bBd88b9E5c81",
  V2_ROUTER:                  "0x8B1539740A7B908665CbAbC41CEB9FFd15FB8ff6",
  V3_FACTORY:                 "0x2b2559098fCE71f534a5aA0B7d04a1bf3848b31E",
  V3_SWAP_ROUTER:             "0x5Bd2ecDaabAAAa5186B34F4F6CE15769161D6E3B",
  POSITION_MANAGER:           "0xfb884fB1bbC02b30cf1f0abf0C6a1BCFF9e35877",
  FEE_COLLECTOR:              "0x4886a228E33679a501b7bBBF01C59AcC61B051c1",
  UNIVERSAL_ROUTER:           "0xc60B4C344fE73bf44BE254C46d2b6A1493c29321",
  AQUA_TOKEN:                 "0x04fA85F25886EeaC5Ac27C038feeD267a927754B",
} as const;

export const V2_INIT_CODE_HASH =
  "0xf793522c82815a3fb6018f2d66ea1d8ebc64734ad9a9e4297ba1bdd0b748fff5";

export const V3_FEE_TIERS = [
  { fee: 100,   label: "0.01%", tickSpacing: 1   },
  { fee: 500,   label: "0.05%", tickSpacing: 10  },
  { fee: 3000,  label: "0.30%", tickSpacing: 60  },
  { fee: 10000, label: "1.00%", tickSpacing: 200 },
] as const;

// Re-export Token type from tokens.ts for convenience
export type { Token } from "./tokens";
