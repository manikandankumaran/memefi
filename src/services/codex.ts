import { CODEX_API_URL, CODEX_SOLANA_NETWORK_ID } from '../constants/config';
import type { Token, TokenBar } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_CODEX_API_KEY ?? '';

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(CODEX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Codex HTTP ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

interface RawToken {
  token: { address: string; name: string; symbol: string; imageThumbUrl?: string };
  priceUSD: string;
  change24: number;
  change1: number;
  volume24: number;
  marketCap?: number;
  liquidity?: number;
  uniqueBuyers24?: number;
  pair?: { address: string };
}

function mapToken(raw: RawToken): Token {
  return {
    address: raw.token.address,
    name: raw.token.name,
    symbol: raw.token.symbol,
    imageUrl: raw.token.imageThumbUrl,
    price: parseFloat(raw.priceUSD),
    priceChange24h: raw.change24,
    priceChange1h: raw.change1,
    volume24h: raw.volume24,
    marketCap: raw.marketCap,
    liquidity: raw.liquidity,
    holders: raw.uniqueBuyers24,
    networkId: CODEX_SOLANA_NETWORK_ID,
    pairAddress: raw.pair?.address,
  };
}

export async function fetchTrendingTokens(limit = 30): Promise<Token[]> {
  const query = `
    query FilterTokens($limit: Int, $networkId: Int) {
      filterTokens(
        filters: {
          networkId: [$networkId]
          liquidity: { gt: 10000 }
          volume24: { gt: 5000 }
        }
        rankings: [{ attribute: trendingScore24 direction: DESC }]
        limit: $limit
      ) {
        results {
          token { address name symbol imageThumbUrl }
          priceUSD
          change24
          change1
          volume24
          marketCap
          liquidity
          uniqueBuyers24
          pair { address }
        }
      }
    }
  `;
  const data = await gql<{ filterTokens: { results: RawToken[] } }>(query, {
    limit,
    networkId: CODEX_SOLANA_NETWORK_ID,
  });
  return data.filterTokens.results.map(mapToken);
}

export async function fetchTokenDetails(address: string): Promise<Token | null> {
  const query = `
    query Token($address: String!, $networkId: Int!) {
      filterTokens(
        filters: {
          tokenAddress: [$address]
          networkId: [$networkId]
        }
        limit: 1
      ) {
        results {
          token { address name symbol imageThumbUrl }
          priceUSD
          change24
          change1
          volume24
          marketCap
          liquidity
          uniqueBuyers24
          pair { address }
        }
      }
    }
  `;
  const data = await gql<{ filterTokens: { results: RawToken[] } }>(query, {
    address,
    networkId: CODEX_SOLANA_NETWORK_ID,
  });
  const result = data.filterTokens.results[0];
  return result ? mapToken(result) : null;
}

export async function fetchTokenBars(
  pairAddress: string,
  resolution: string = '60',
  from: number,
  to: number,
): Promise<TokenBar[]> {
  const query = `
    query GetBars($symbol: String!, $from: Int!, $to: Int!, $resolution: String!) {
      getBars(
        symbol: $symbol
        from: $from
        to: $to
        resolution: $resolution
        removeLeadingNullValues: true
      ) {
        t o h l c v
      }
    }
  `;
  const data = await gql<{
    getBars: { t: number[]; o: number[]; h: number[]; l: number[]; c: number[]; v: number[] };
  }>(query, {
    symbol: `${pairAddress}:${CODEX_SOLANA_NETWORK_ID}`,
    from,
    to,
    resolution,
  });
  const { t, o, h, l, c, v } = data.getBars;
  return t.map((time, i) => ({ time, open: o[i], high: h[i], low: l[i], close: c[i], volume: v[i] }));
}

export async function fetchTokenPrice(address: string): Promise<number> {
  const query = `
    query GetTokenPrices($inputs: [GetTokenPriceInput!]!) {
      getTokenPrices(inputs: $inputs) {
        priceUsd
      }
    }
  `;
  const data = await gql<{ getTokenPrices: { priceUsd: number }[] }>(query, {
    inputs: [{ address, networkId: CODEX_SOLANA_NETWORK_ID }],
  });
  return data.getTokenPrices[0]?.priceUsd ?? 0;
}
