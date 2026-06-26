import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { getSwapQuote, buildSwapTransaction, SOL_MINT, toRawAmount } from '../services/jupiter';
import { getSolanaConnection } from '../services/alchemy';
import { useSolanaWallet } from '../hooks/useWallet';
import type { Token } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  token: Token;
  solBalance: number;
}

type Side = 'buy' | 'sell';

interface SolanaProvider {
  signTransaction(tx: VersionedTransaction): Promise<VersionedTransaction>;
}

export default function SwapModal({ visible, onClose, token, solBalance }: Props) {
  const { wallet } = useSolanaWallet();

  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoteOut, setQuoteOut] = useState<string | null>(null);

  const SOL_DECIMALS = 9;
  const TOKEN_DECIMALS = 6;

  const fetchQuote = useCallback(async (val: string) => {
    if (!val || isNaN(parseFloat(val))) { setQuoteOut(null); return; }
    try {
      const rawIn = toRawAmount(parseFloat(val), side === 'buy' ? SOL_DECIMALS : TOKEN_DECIMALS);
      const quote = await getSwapQuote({
        inputMint: side === 'buy' ? SOL_MINT : token.address,
        outputMint: side === 'buy' ? token.address : SOL_MINT,
        amount: rawIn,
      });
      const outDecimals = side === 'buy' ? TOKEN_DECIMALS : SOL_DECIMALS;
      setQuoteOut((parseInt(quote.outAmount, 10) / Math.pow(10, outDecimals)).toFixed(4));
    } catch {
      setQuoteOut(null);
    }
  }, [side, token.address]);

  const handleAmountChange = (val: string) => {
    setAmount(val);
    fetchQuote(val);
  };

  const handleSwap = async () => {
    if (!wallet || !amount) return;
    setLoading(true);
    try {
      const rawIn = toRawAmount(parseFloat(amount), side === 'buy' ? SOL_DECIMALS : TOKEN_DECIMALS);
      const quote = await getSwapQuote({
        inputMint: side === 'buy' ? SOL_MINT : token.address,
        outputMint: side === 'buy' ? token.address : SOL_MINT,
        amount: rawIn,
      });
      const { swapTransaction } = await buildSwapTransaction({
        quoteResponse: quote,
        userPublicKey: wallet.address,
      });

      const provider = (await wallet.getProvider()) as SolanaProvider;
      const conn: Connection = getSolanaConnection();
      const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
      const signedTx = await provider.signTransaction(tx);

      const sig = await conn.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });
      await conn.confirmTransaction(sig, 'confirmed');

      Alert.alert('Swap successful! 🎉', `TX: ${sig.slice(0, 20)}...`);
      setAmount('');
      setQuoteOut(null);
      onClose();
    } catch (e: unknown) {
      Alert.alert('Swap failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={{
          backgroundColor: '#141414', borderTopLeftRadius: 28, borderTopRightRadius: 28,
          paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,
        }}>
          {/* Handle */}
          <View style={{
            width: 40, height: 4, backgroundColor: '#333', borderRadius: 4,
            alignSelf: 'center', marginBottom: 20,
          }} />

          <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 20 }}>
            Trade {token.symbol}
          </Text>

          {/* Buy / Sell toggle */}
          <View style={{
            flexDirection: 'row', backgroundColor: '#0A0A0A',
            borderRadius: 14, padding: 4, marginBottom: 24,
          }}>
            {(['buy', 'sell'] as Side[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => { setSide(s); setAmount(''); setQuoteOut(null); }}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                  backgroundColor: side === s ? (s === 'buy' ? '#00C896' : '#FF4757') : 'transparent',
                }}
              >
                <Text style={{
                  fontWeight: '600', textTransform: 'capitalize',
                  color: side === s ? '#000' : '#666',
                }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* You pay */}
          <View style={{
            backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#2A2A2A',
            borderRadius: 14, padding: 16, marginBottom: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#666', fontSize: 12 }}>You pay</Text>
              {side === 'buy' && (
                <TouchableOpacity onPress={() => handleAmountChange(solBalance.toFixed(4))}>
                  <Text style={{ color: '#00FFA3', fontSize: 12 }}>
                    Max {solBalance.toFixed(4)} SOL
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="#444"
                keyboardType="decimal-pad"
                style={{ flex: 1, color: '#FFF', fontSize: 26, fontWeight: '700' }}
              />
              <Text style={{ color: '#888', fontSize: 15, fontWeight: '600' }}>
                {side === 'buy' ? 'SOL' : token.symbol}
              </Text>
            </View>
          </View>

          {/* You receive */}
          <View style={{
            backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#2A2A2A',
            borderRadius: 14, padding: 16, marginBottom: 24,
          }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>You receive</Text>
            <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '700' }}>
              {quoteOut ?? '—'}
            </Text>
            <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>
              {side === 'buy' ? token.symbol : 'SOL'}
            </Text>
          </View>

          {/* Swap button */}
          <TouchableOpacity
            onPress={handleSwap}
            disabled={loading || !amount || !wallet}
            style={{
              paddingVertical: 16, borderRadius: 18, alignItems: 'center',
              backgroundColor: loading || !amount || !wallet
                ? '#2A2A2A'
                : side === 'buy' ? '#00C896' : '#FF4757',
            }}
          >
            {loading ? (
              <ActivityIndicator color={side === 'buy' ? '#000' : '#fff'} />
            ) : !wallet ? (
              <Text style={{ color: '#666', fontWeight: '700', fontSize: 15 }}>
                Wallet not ready
              </Text>
            ) : (
              <Text style={{
                fontWeight: '700', fontSize: 15,
                color: !amount ? '#666' : '#000',
              }}>
                {side === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
