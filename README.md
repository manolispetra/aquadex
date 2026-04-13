# AquaDex Frontend

Next.js 14 frontend for AquaDex — the hybrid DEX on Monad Mainnet.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Fill in your WalletConnect project ID in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/swap` | Main swap interface — auto-routes V2 vs V3 |
| `/pools` | Classic pool list |
| `/pools/add` | Add liquidity (V2 Classic) |
| `/farm` | Liquidity mining (coming soon) |
| `/portfolio` | Wallet balances + positions |
| `/roadmap` | Full project roadmap |

## Logo

Put your logo file at `public/logo.png`.
The image at `/mnt/user-data/uploads/Gemini_Generated_Image_6bldnu6bldnu6bld.png`
should be saved as `public/logo.png`.

## Contract Addresses (Monad Mainnet)

```
WMON:                0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A
V2 Factory:          0xF76df967c9FF089F577A8dbD89F4bBd88b9E5c81
V2 Router:           0x8B1539740A7B908665CbAbC41CEB9FFd15FB8ff6
V3 Factory:          0x2b2559098fCE71f534a5aA0B7d04a1bf3848b31E
V3 SwapRouter:       0x5Bd2ecDaabAAAa5186B34F4F6CE15769161D6E3B
Position Manager:    0xfb884fB1bbC02b30cf1f0abf0C6a1BCFF9e35877
Universal Router:    0xc60B4C344fE73bf44BE254C46d2b6A1493c29321
AQUA Token:          0x04fA85F25886EeaC5Ac27C038feeD267a927754B
```

## Stack

- **Framework**: Next.js 14 (App Router)
- **Wallet**: wagmi v2 + viem + RainbowKit
- **Styling**: Tailwind CSS + custom ocean theme
- **Animations**: Framer Motion
- **Fonts**: Syne (display) + DM Sans (body)
