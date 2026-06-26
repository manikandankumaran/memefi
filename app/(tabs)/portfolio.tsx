import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrivy } from '@privy-io/expo';
import { useSolanaWallet } from '../../src/hooks/useWallet';
import { useSolBalance, usePortfolio } from '../../src/hooks/usePortfolio';
import { requestDevnetAirdrop } from '../../src/services/alchemy';
import { SOLANA_NETWORK } from '../../src/constants/config';
import type { PortfolioToken } from '../../src/types';

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  if (price < 1) return `$${price.toFixed(6)}`;
  return `$${price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
}

function PortfolioCard({ item, onPress }: { item: PortfolioToken; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' }}>
        {item.token.imageUrl ? (
          <Image source={{ uri: item.token.imageUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>{item.token.symbol.slice(0, 2)}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>{item.token.symbol}</Text>
        <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{item.balance.toFixed(2)} tokens</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>${item.usdValue.toFixed(2)}</Text>
        <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{formatPrice(item.token.price)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PortfolioScreen() {
  const router = useRouter();
  const { logout } = usePrivy();
  const { address: walletAddress } = useSolanaWallet();

  const { data: solBalance = 0, refetch: refetchSol, isRefetching: solRefetching } = useSolBalance(walletAddress);
  const { data: portfolio = [], refetch: refetchPortfolio, isLoading, isRefetching } = usePortfolio(walletAddress);

  const totalUsd = portfolio.reduce((sum, p) => sum + p.usdValue, 0);
  const solUsd = solBalance * 150;

  const onRefresh = async () => {
    await Promise.all([refetchSol(), refetchPortfolio()]);
  };

  const handleAirdrop = async () => {
    if (!walletAddress) return;
    try {
      await requestDevnetAirdrop(walletAddress, 1);
      Alert.alert('Airdrop received! 🪂', '1 SOL added to your devnet wallet');
      refetchSol();
    } catch (e: unknown) {
      Alert.alert('Airdrop failed', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const truncate = (addr: string) => (addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : '');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>Portfolio</Text>
        <TouchableOpacity
          onPress={() => logout()}
          style={{ backgroundColor: '#141414', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#2A2A2A' }}
        >
          <Text style={{ color: '#888', fontSize: 12 }}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={portfolio}
        keyExtractor={(item) => item.token.address}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || solRefetching}
            onRefresh={onRefresh}
            tintColor="#00FFA3"
            colors={['#00FFA3']}
          />
        }
        ListHeaderComponent={
          <>
            {/* Wallet card */}
            <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: '#141414', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1E1E1E' }}>
              <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Total Portfolio Value</Text>
              <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '700', marginBottom: 4 }}>
                ${(totalUsd + solUsd).toFixed(2)}
              </Text>

              {walletAddress && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FFA3' }} />
                  <Text style={{ color: '#666', fontSize: 11, fontFamily: 'monospace' }}>
                    {truncate(walletAddress)}
                  </Text>
                </View>
              )}

              {/* SOL row */}
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#1E1E1E', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 22 }}>◎</Text>
                  <View>
                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>SOL</Text>
                    <Text style={{ color: '#555', fontSize: 11 }}>Solana</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>{solBalance.toFixed(4)} SOL</Text>
                  <Text style={{ color: '#555', fontSize: 12 }}>${solUsd.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Devnet airdrop */}
            {SOLANA_NETWORK === 'devnet' && (
              <TouchableOpacity
                onPress={handleAirdrop}
                style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(153,69,255,0.1)', borderWidth: 1, borderColor: 'rgba(153,69,255,0.3)', borderRadius: 20, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#9945FF', fontWeight: '600', fontSize: 14 }}>
                  🪂 Request Devnet Airdrop (1 SOL)
                </Text>
              </TouchableOpacity>
            )}

            {portfolio.length > 0 && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#555', fontSize: 12 }}>Token</Text>
                <Text style={{ color: '#555', fontSize: 12 }}>Value</Text>
              </View>
            )}

            {isLoading && (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <ActivityIndicator color="#00FFA3" />
                <Text style={{ color: '#555', fontSize: 14, marginTop: 8 }}>Loading holdings...</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <PortfolioCard
            item={item}
            onPress={() => router.push(`/token/${item.token.address}`)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>💼</Text>
              <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16, marginBottom: 8 }}>No tokens yet</Text>
              <Text style={{ color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                Buy your first memecoin from the Trending tab
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
