import { JUPITER_API_URL } from '../constants/config';
import type { SwapQuote } from '../types';

const JUPITER_KEY = process.env.EXPO_PUBLIC_JUPITER_API_KEY ?? '';

// SOL mint address
export const SOL_MINT = 'So11111111111111111111111111111111111111112';
// USDC mint (devnet)
export const USDC_MINT_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
// USDC mint (mainnet)
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(JUPITER_KEY ? { Authorization: `Bearer ${JUPITER_KEY}` } : {}),
};

export async function getSwapQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number; // in lamports / smallest unit
  slippageBps?: number;
}): Promise<SwapQuote> {
  const { inputMint, outputMint, amount, slippageBps = 50 } = params;
  const url = `${JUPITER_API_URL}/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Jupiter quote error: ${res.status}`);
  return res.json() as Promise<SwapQuote>;
}

export async function buildSwapTransaction(params: {
  quoteResponse: SwapQuote;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
}): Promise<{ swapTransaction: string }> {
  const res = await fetch(`${JUPITER_API_URL}/v6/swap`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  });
  if (!res.ok) throw new Error(`Jupiter swap build error: ${res.status}`);
  return res.json() as Promise<{ swapTransaction: string }>;
}

export function formatTokenAmount(amount: number, decimals: number): string {
  return (amount / Math.pow(10, decimals)).toFixed(4);
}

export function toRawAmount(amount: number, decimals: number): number {
  return Math.floor(amount * Math.pow(10, decimals));
}
