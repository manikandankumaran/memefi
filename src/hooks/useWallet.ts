import { useEmbeddedSolanaWallet } from '@privy-io/expo';

/**
 * Convenience hook that unwraps EmbeddedSolanaWalletState into a simple wallet object.
 * `wallets` is only populated when status === 'connected'.
 */
export function useSolanaWallet() {
  const state = useEmbeddedSolanaWallet();

  // `wallets` is part of EmbeddedSolanaWalletActions, present on all non-disconnected states
  const wallets = (state as { wallets?: { address: string; getProvider: () => Promise<unknown> }[] }).wallets ?? [];
  const wallet = wallets[0] ?? null;

  return {
    state,
    wallet,
    address: wallet?.address ?? null,
    isConnected: state.status === 'connected',
    status: state.status,
    /** Create an embedded Solana wallet for the user if one doesn't exist yet */
    create: state.create,
  };
}
