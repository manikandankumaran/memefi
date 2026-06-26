import { useQuery } from '@tanstack/react-query';
import { getSolBalance, getTokenAccounts } from '../services/alchemy';
import { fetchTokenPrice } from '../services/codex';
import type { PortfolioToken } from '../types';

export function useSolBalance(walletAddress: string | null) {
  return useQuery({
    queryKey: ['solBalance', walletAddress],
    queryFn: () => getSolBalance(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePortfolio(walletAddress: string | null) {
  return useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: async (): Promise<PortfolioToken[]> => {
      const accounts = await getTokenAccounts(walletAddress!);
      const portfolio = await Promise.allSettled(
        accounts.map(async (acc) => {
          const price = await fetchTokenPrice(acc.mint).catch(() => 0);
          return {
            token: {
              address: acc.mint,
              name: acc.mint.slice(0, 4) + '...' + acc.mint.slice(-4),
              symbol: '???',
              price,
              priceChange24h: 0,
              volume24h: 0,
              networkId: 1399811149,
            },
            balance: acc.uiAmount,
            usdValue: acc.uiAmount * price,
          } as PortfolioToken;
        }),
      );
      return portfolio
        .filter((r): r is PromiseFulfilledResult<PortfolioToken> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((p) => p.usdValue > 0)
        .sort((a, b) => b.usdValue - a.usdValue);
    },
    enabled: !!walletAddress,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
