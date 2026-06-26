import { useEffect } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useSolanaWallet } from './useWallet';
import { upsertUser } from '../services/supabase';

/**
 * After login, auto-create the embedded Solana wallet if not yet created,
 * then upsert the user record in Supabase.
 */
export function useWalletSetup() {
  const { user } = usePrivy();
  const { state, address } = useSolanaWallet();

  useEffect(() => {
    if (!user) return;
    if (state.status === 'not-created' && state.create) {
      state.create().catch(console.warn);
    }
  }, [user, state]);

  useEffect(() => {
    if (!user || !address) return;
    upsertUser(user.id, address).catch(console.warn);
  }, [user, address]);
}
