import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface WatchlistEntry {
  id: string;
  user_id: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  added_at: string;
}

export interface TradeRecord {
  id: string;
  user_id: string;
  token_address: string;
  token_symbol: string;
  side: 'buy' | 'sell';
  amount_in: number;
  amount_out: number;
  tx_signature: string;
  network: string;
  created_at: string;
}

export async function upsertUser(userId: string, walletAddress: string) {
  return supabase
    .from('users')
    .upsert({ id: userId, wallet_address: walletAddress, updated_at: new Date().toISOString() });
}

export async function getWatchlist(userId: string): Promise<WatchlistEntry[]> {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addToWatchlist(entry: Omit<WatchlistEntry, 'id' | 'added_at'>) {
  return supabase.from('watchlist').insert(entry);
}

export async function removeFromWatchlist(userId: string, tokenAddress: string) {
  return supabase.from('watchlist').delete().eq('user_id', userId).eq('token_address', tokenAddress);
}

export async function saveTrade(trade: Omit<TradeRecord, 'id' | 'created_at'>) {
  return supabase.from('trades').insert({ ...trade, created_at: new Date().toISOString() });
}

export async function getTradeHistory(userId: string): Promise<TradeRecord[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}
