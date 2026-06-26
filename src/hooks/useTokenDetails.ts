import { useQuery } from '@tanstack/react-query';
import { fetchTokenDetails, fetchTokenBars } from '../services/codex';

export function useTokenDetails(address: string) {
  return useQuery({
    queryKey: ['token', address],
    queryFn: () => fetchTokenDetails(address),
    staleTime: 30_000,
    enabled: !!address,
  });
}

export function useTokenBars(pairAddress: string | undefined, resolution = '60') {
  return useQuery({
    queryKey: ['bars', pairAddress, resolution],
    queryFn: () => {
      const to = Math.floor(Date.now() / 1000);
      // 7 days of data
      const from = to - 7 * 24 * 60 * 60;
      return fetchTokenBars(pairAddress!, resolution, from, to);
    },
    staleTime: 60_000,
    enabled: !!pairAddress,
  });
}
