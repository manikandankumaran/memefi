import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTokenDetails, useTokenBars } from '../../src/hooks/useTokenDetails';
import { useSolBalance } from '../../src/hooks/usePortfolio';
import PriceChart from '../../src/components/PriceChart';
import SwapModal from '../../src/components/SwapModal';
import { useSolanaWallet } from '../../src/hooks/useWallet';

const RESOLUTIONS: Record<string, string> = { '1H': '5', '4H': '15', '1D': '60', '1W': '240' };

function formatLarge(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(3)}`;
  if (price < 1) return `$${price.toFixed(6)}`;
  return `$${price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
}

export default function TokenDetailScreen() {
  const { address } = useLocalSearchParams<{ address: string }>();
  const router = useRouter();
  const { address: walletAddress } = useSolanaWallet();

  const [chartPeriod, setChartPeriod] = useState('1D');
  const [swapOpen, setSwapOpen] = useState(false);

  const {
    data: token,
    isLoading,
    refetch,
    isRefetching,
  } = useTokenDetails(address ?? '');

  const { data: bars = [], isLoading: barsLoading } = useTokenBars(
    token?.pairAddress,
    RESOLUTIONS[chartPeriod],
  );

  const { data: solBalance = 0 } = useSolBalance(walletAddress);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#00FFA3" size="large" />
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Token not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#00FFA3' }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isUp = token.priceChange24h >= 0;
  const accentColor = isUp ? '#00C896' : '#FF4757';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      {/* Nav */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Text style={{ color: '#FFF', fontSize: 22 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center', marginRight: 8, overflow: 'hidden' }}>
            {token.imageUrl
              ? <Image source={{ uri: token.imageUrl }} style={{ width: 32, height: 32, borderRadius: 16 }} />
              : <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>{token.symbol.slice(0, 2)}</Text>
            }
          </View>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 18 }}>{token.symbol}</Text>
          <Text style={{ color: '#555', fontSize: 14, marginLeft: 8 }}>{token.name}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00FFA3" colors={['#00FFA3']} />
        }
      >
        {/* Price */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#FFF', fontSize: 38, fontWeight: '700' }}>
            {formatPrice(token.price)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 }}>
            <Text style={{ color: accentColor, fontSize: 16, fontWeight: '600' }}>
              {isUp ? '+' : ''}{token.priceChange24h.toFixed(2)}%
            </Text>
            <Text style={{ color: '#555', fontSize: 13 }}>24h</Text>
            {token.priceChange1h !== undefined && (
              <>
                <Text style={{ color: token.priceChange1h >= 0 ? '#00C896' : '#FF4757', fontSize: 13, fontWeight: '500' }}>
                  {token.priceChange1h >= 0 ? '+' : ''}{token.priceChange1h.toFixed(2)}%
                </Text>
                <Text style={{ color: '#555', fontSize: 13 }}>1h</Text>
              </>
            )}
          </View>
        </View>

        {/* Chart period selector */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 }}>
          {Object.keys(RESOLUTIONS).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setChartPeriod(p)}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: chartPeriod === p ? '#242424' : 'transparent' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: chartPeriod === p ? '#FFF' : '#555' }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          {barsLoading ? (
            <View style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#00FFA3" />
            </View>
          ) : (
            <PriceChart bars={bars} color={accentColor} height={180} />
          )}
        </View>

        {/* Stats */}
        <View style={{ marginHorizontal: 16, backgroundColor: '#141414', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1E1E1E' }}>
          <Text style={{ color: '#FFF', fontWeight: '600', marginBottom: 12 }}>Statistics</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }}>
            {[
              { label: 'Market Cap', value: formatLarge(token.marketCap) },
              { label: 'Volume 24h', value: formatLarge(token.volume24h) },
              { label: 'Liquidity', value: formatLarge(token.liquidity) },
              { label: 'Buyers 24h', value: token.holders?.toLocaleString() ?? '—' },
            ].map((stat) => (
              <View key={stat.label} style={{ width: '50%' }}>
                <Text style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>{stat.label}</Text>
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contract */}
        <View style={{ marginHorizontal: 16, backgroundColor: '#141414', borderRadius: 20, padding: 16, marginBottom: 120, borderWidth: 1, borderColor: '#1E1E1E' }}>
          <Text style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>Contract Address</Text>
          <Text style={{ color: '#FFF', fontSize: 11, fontFamily: 'monospace' }} numberOfLines={1} ellipsizeMode="middle">
            {address}
          </Text>
        </View>
      </ScrollView>

      {/* Trade CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16, backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: '#1A1A1A' }}>
        <TouchableOpacity
          onPress={() => setSwapOpen(true)}
          activeOpacity={0.85}
          style={{ backgroundColor: '#00FFA3', paddingVertical: 16, borderRadius: 20, alignItems: 'center' }}
        >
          <Text style={{ color: '#000', fontWeight: '700', fontSize: 16 }}>Trade {token.symbol}</Text>
        </TouchableOpacity>
      </View>

      <SwapModal
        visible={swapOpen}
        onClose={() => setSwapOpen(false)}
        token={token}
        solBalance={solBalance}
      />
    </SafeAreaView>
  );
}
