import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_URL } from '../constants/config';

let _connection: Connection | null = null;

export function getSolanaConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }
  return _connection;
}

export async function getSolBalance(walletAddress: string): Promise<number> {
  const conn = getSolanaConnection();
  const pk = new PublicKey(walletAddress);
  const lamports = await conn.getBalance(pk);
  return lamports / LAMPORTS_PER_SOL;
}

export interface TokenAccount {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
}

export async function getTokenAccounts(walletAddress: string): Promise<TokenAccount[]> {
  const conn = getSolanaConnection();
  const pk = new PublicKey(walletAddress);
  const accounts = await conn.getParsedTokenAccountsByOwner(pk, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  });

  return accounts.value
    .map((item) => {
      const info = item.account.data.parsed.info as {
        mint: string;
        tokenAmount: { amount: string; decimals: number; uiAmount: number | null };
      };
      return {
        mint: info.mint,
        balance: parseInt(info.tokenAmount.amount, 10),
        decimals: info.tokenAmount.decimals,
        uiAmount: info.tokenAmount.uiAmount ?? 0,
      };
    })
    .filter((a) => a.uiAmount > 0);
}

export async function requestDevnetAirdrop(walletAddress: string, solAmount = 1): Promise<string> {
  const conn = getSolanaConnection();
  const pk = new PublicKey(walletAddress);
  const sig = await conn.requestAirdrop(pk, solAmount * LAMPORTS_PER_SOL);
  await conn.confirmTransaction(sig);
  return sig;
}
