import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

// ── Monad Mainnet chain definition ───────────────────────────
export const monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.monad.xyz",
        "https://rpc1.monad.xyz",
        "https://rpc3.monad.xyz",
        "https://monad-mainnet.drpc.org",
      ],
      webSocket: ["wss://rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://monadscan.com" },
    vision:   { name: "MonadVision", url: "https://monadvision.com" },
  },
  testnet: false,
});

// ── Wagmi config ─────────────────────────────────────────────
export const wagmiConfig = createConfig({
  chains: [monad],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "aquadex-monad",
    }),
  ],
  transports: {
    [monad.id]: http("https://rpc.monad.xyz"),
  },
});
