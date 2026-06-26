export const CODEX_API_URL = 'https://graph.codex.io/graphql';
export const JUPITER_API_URL = 'https://api.jup.ag';
export const SOLANA_NETWORK = (process.env.EXPO_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') ?? 'devnet';

export const SOLANA_RPC_URL =
  process.env.EXPO_PUBLIC_SOLANA_RPC_URL ??
  (SOLANA_NETWORK === 'devnet'
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com');

// Solana network ID in Codex (1 = Solana mainnet)
export const CODEX_SOLANA_NETWORK_ID = 1399811149;

export const COLORS = {
  bgPrimary: '#0A0A0A',
  bgSecondary: '#141414',
  bgCard: '#1A1A1A',
  bgElevated: '#242424',
  brandGreen: '#00FFA3',
  brandPurple: '#9945FF',
  up: '#00C896',
  down: '#FF4757',
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8B8B',
  textMuted: '#444444',
  border: '#2A2A2A',
} as const;
