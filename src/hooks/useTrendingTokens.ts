import { useQuery } from '@tanstack/react-query';
import { fetchTrendingTokens } from '../services/codex';

export function useTrendingTokens() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: () => fetchTrendingTokens(40),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
