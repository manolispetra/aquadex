"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10000, refetchOnWindowFocus: false } },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00c8e8",
            accentColorForeground: "#020812",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          appInfo={{
            appName: "AquaDex",
            learnMoreUrl: "https://aquadex.fi",
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
