export interface Token {
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  price: number;
  priceChange24h: number;
  priceChange1h?: number;
  volume24h: number;
  marketCap?: number;
  liquidity?: number;
  holders?: number;
  networkId: number;
  pairAddress?: string;
}

export interface TokenBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioToken {
  token: Token;
  balance: number;
  usdValue: number;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: unknown[];
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  createdAt: string;
  totalPnl?: number;
}
