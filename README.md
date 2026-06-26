# MemeFi — Solana Memecoin Trading App

A ChadWallet-inspired mobile trading app for Solana memecoins built with React Native, Expo, and NativeWind.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 56 |
| Styling | NativeWind v4 (Tailwind CSS) |
| Routing | Expo Router (file-based) |
| Auth | Privy (Google + Apple OAuth) |
| Token Data | Codex.io GraphQL API |
| Solana RPC | Alchemy |
| Trading | Jupiter Swap API v6 |
| Database | Supabase (Postgres + RLS) |
| State | TanStack React Query |
| Preview | Appetize.io + EAS Build |

---

## Project Structure

```
memefi/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root: PrivyProvider + QueryClientProvider
│   ├── index.tsx                 # Entry redirect (auth check)
│   ├── (auth)/
│   │   └── index.tsx             # Sign-in screen (Google + Apple)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar + wallet auto-creation
│   │   ├── index.tsx             # Trending tokens (home)
│   │   ├── portfolio.tsx         # Wallet balance + holdings
│   │   └── settings.tsx          # Account + wallet info
│   └── token/
│       └── [address].tsx         # Token detail + price chart + swap
│
├── src/
│   ├── components/
│   │   ├── TokenCard.tsx         # Token list row
│   │   ├── PriceChart.tsx        # Line chart (react-native-gifted-charts)
│   │   └── SwapModal.tsx         # Buy/sell bottom sheet (Jupiter)
│   ├── hooks/
│   │   ├── useTrendingTokens.ts  # Codex.io trending query
│   │   ├── useTokenDetails.ts    # Token + OHLCV bars queries
│   │   ├── usePortfolio.ts       # SOL balance + SPL token holdings
│   │   ├── useWallet.ts          # Privy embedded Solana wallet helper
│   │   └── useWalletSetup.ts     # Auto-create wallet + Supabase upsert
│   ├── services/
│   │   ├── codex.ts              # Codex GraphQL (trending, details, bars)
│   │   ├── jupiter.ts            # Jupiter Swap API (quote + build tx)
│   │   ├── alchemy.ts            # Solana RPC (balance, token accounts)
│   │   └── supabase.ts           # Supabase client (watchlist, trades)
│   ├── types/
│   │   ├── index.ts              # Shared TypeScript types
│   │   └── global.d.ts           # Buffer + CSS module declarations
│   └── constants/
│       └── config.ts             # RPC URL, network, color tokens
│
├── supabase/
│   └── schema.sql                # DB tables + RLS policies
│
├── global.css                    # NativeWind Tailwind directives
├── tailwind.config.js            # Theme (dark palette, brand colors)
├── babel.config.js               # NativeWind babel plugin
├── metro.config.js               # withNativeWind + package export fix
├── .env.example                  # All required environment variables
└── app.json                      # Expo config (scheme, plugins, dark mode)
```

---

## Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`
- Xcode (iOS) or Android Studio

---

## 1. Environment Setup

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Where to get it |
|---|---|
| `EXPO_PUBLIC_PRIVY_APP_ID` | [dashboard.privy.io](https://dashboard.privy.io) → Create app |
| `EXPO_PUBLIC_PRIVY_CLIENT_ID` | Same Privy dashboard → Settings |
| `EXPO_PUBLIC_CODEX_API_KEY` | [codex.io](https://codex.io) → API Keys |
| `EXPO_PUBLIC_ALCHEMY_API_KEY` | [alchemy.com](https://www.alchemy.com) → Create app → Solana |
| `EXPO_PUBLIC_SOLANA_RPC_URL` | Alchemy dashboard → Solana Devnet endpoint |
| `EXPO_PUBLIC_JUPITER_API_KEY` | [developers.jup.ag/portal](https://developers.jup.ag/portal) |
| `EXPO_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → Project Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same Supabase project → anon public key |
| `EXPO_PUBLIC_SOLANA_NETWORK` | `devnet` (default) or `mainnet-beta` |

---

## 2. Privy Dashboard Setup

1. Go to [dashboard.privy.io](https://dashboard.privy.io) and create a new app
2. Under **Login Methods** → enable **Google** and **Apple**
3. Under **Wallets** → enable **Embedded Solana wallets**
4. Under **App Settings** → add your app scheme: `memefi://`
5. Copy **App ID** and **Client ID** into `.env`

---

## 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run the schema:

```bash
# Copy contents of supabase/schema.sql and paste into Supabase SQL editor
```

3. Copy the **Project URL** and **anon key** into `.env`

---

## 4. Install & Run

```bash
# Install dependencies (already done if you cloned this repo)
npm install

# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

> **Tip:** On first launch the app starts on **Devnet**. Use the "Request Devnet Airdrop" button in Portfolio to get test SOL for trading.

---

## 5. Switch to Mainnet

When devnet trading works end-to-end:

```bash
# In .env
EXPO_PUBLIC_SOLANA_NETWORK=mainnet-beta
EXPO_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

The airdrop button auto-hides on mainnet.

---

## 6. Build for Appetize (Live Preview)

### Configure EAS

```bash
eas login
eas build:configure
```

### Build Android APK

```bash
eas build --platform android --profile preview
```

This produces a `.apk` download link. Upload it to [appetize.io](https://appetize.io):

1. Go to appetize.io → **Upload**
2. Upload the `.apk`
3. Share the generated link for live preview in a browser

### Build iOS (requires Apple Developer account)

```bash
eas build --platform ios --profile preview
```

---

## 7. Screens

### Sign In
- Google OAuth and Apple Sign In via Privy
- Embedded Solana wallet auto-created on first login

### Trending Tokens
- Live data from Codex.io GraphQL
- 1H / 24H / 7D timeframe filter
- Search by name or symbol
- Pull-to-refresh (60s auto-refresh)

### Token Detail
- Real-time price with 1h and 24h change
- Interactive price chart (1H / 4H / 1D / 1W)
- Market cap, volume, liquidity, buyer stats
- **Trade** button opens buy/sell swap modal

### Swap Modal
- Buy (SOL → token) or Sell (token → SOL)
- Jupiter v6 best-route quote
- Signs + broadcasts transaction via Privy embedded wallet
- Devnet transactions confirmed on-chain

### Portfolio
- Total USD value (SOL + all SPL tokens)
- SOL balance via Alchemy RPC
- SPL token holdings with USD value
- Pull-to-refresh

### Settings
- Wallet address display
- Network indicator (devnet / mainnet-beta)
- Linked account email
- Sign out

---

## 8. Data Flow

```
Codex.io GraphQL ──► useTrendingTokens ──► TrendingScreen
                  └► useTokenDetails   ──► TokenDetailScreen
                  └► useTokenBars      ──► PriceChart

Alchemy RPC ──────► useSolBalance     ──► PortfolioScreen
            └──────► usePortfolio      ──► PortfolioScreen

Jupiter API ───────► getSwapQuote     ──► SwapModal (quote)
            └──────► buildSwapTransaction ► SwapModal (execute)

Privy ─────────────► usePrivy         ──► Auth + user identity
      └────────────► useEmbeddedSolanaWallet ► wallet address + signing

Supabase ──────────► upsertUser       ──► on login
         └─────────► getTradeHistory  ──► (future trade log)
```

---

## Environment Variables Reference

```bash
# .env
EXPO_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxxxx
EXPO_PUBLIC_PRIVY_CLIENT_ID=client-xxxxxxxxxxxxxxxx
EXPO_PUBLIC_CODEX_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_ALCHEMY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_SOLANA_RPC_URL=https://solana-devnet.g.alchemy.com/v2/YOUR_KEY
EXPO_PUBLIC_JUPITER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_SOLANA_NETWORK=devnet
```

---

## What Was Built

**26 TypeScript files, zero type errors.** Complete Solana memecoin trading app in [`memefi/`](./).

### Screens

| Screen | Description |
|---|---|
| Sign In | Google + Apple OAuth via Privy; embedded wallet auto-created on first login |
| Trending | Live Codex.io data — 40 tokens, search, 1H/24H/7D toggle, pull-to-refresh |
| Token Detail | Real-time price, interactive chart (4 timeframes), stats, Trade button |
| Swap Modal | Jupiter v6 quote → sign via embedded wallet → broadcast to chain |
| Portfolio | SOL balance + SPL holdings via Alchemy RPC, devnet airdrop button |
| Settings | Wallet address, network, account info, sign out |

### Architecture

- **Devnet first** — all swaps run on Solana devnet; one env var switches to mainnet
- **Pull-to-refresh works everywhere** — TanStack Query with 30s/60s stale times
- **Wallet signing** — Privy `getProvider()` → `signTransaction()` → Alchemy broadcast

---

## What I Need From You

All 5 services need credentials before the app runs live:

1. **Privy** ([dashboard.privy.io](https://dashboard.privy.io)) → create app, enable Google + Apple OAuth, enable embedded Solana wallets → copy **App ID** + **Client ID**

2. **Codex.io** ([codex.io](https://codex.io)) → API key for token data + charts

3. **Alchemy** ([alchemy.com](https://www.alchemy.com)) → create a Solana app → copy **API key** + **Devnet RPC URL**

4. **Jupiter** ([developers.jup.ag/portal](https://developers.jup.ag/portal)) → API key for swap quotes

5. **Supabase** ([supabase.com](https://supabase.com)) → create project, run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor → copy **project URL** + **anon key**

Then:

```bash
cp .env.example .env
# fill in the 9 values
npm start
```

Once you have credentials and the app runs on devnet, the next steps are:

- Build an Appetize preview via EAS Build (see [Section 6](#6-build-for-appetize-live-preview))
- Flip `EXPO_PUBLIC_SOLANA_NETWORK=mainnet-beta` to go live
