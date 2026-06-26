import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrendingTokens } from '../../src/hooks/useTrendingTokens';
import TokenCard from '../../src/components/TokenCard';
import type { Token } from '../../src/types';

const TIMEFRAMES = ['1H', '24H', '7D'];

export default function TrendingScreen() {
  const router = useRouter();
  const { data: tokens, isLoading, isRefetching, refetch, error } = useTrendingTokens();
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState('24H');

  const filtered = (tokens ?? []).filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTokenPress = useCallback(
    (token: Token) => router.push(`/token/${token.address}`),
    [router],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>Trending</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#141414', borderRadius: 12, padding: 4, gap: 2 }}>
            {TIMEFRAMES.map((tf) => (
              <TouchableOpacity
                key={tf}
                onPress={() => setTimeframe(tf)}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: timeframe === tf ? '#242424' : 'transparent' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: timeframe === tf ? '#FFF' : '#555' }}>
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1E1E1E' }}>
          <Text style={{ color: '#555', marginRight: 8 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tokens..."
            placeholderTextColor="#444"
            style={{ flex: 1, color: '#FFF', fontSize: 14 }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#555', fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Column headers */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }}>
        <Text style={{ width: 24, color: '#444', fontSize: 12, marginRight: 12 }}>#</Text>
        <Text style={{ flex: 1, color: '#444', fontSize: 12 }}>Token</Text>
        <Text style={{ color: '#444', fontSize: 12 }}>Price / 24h</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#00FFA3" size="large" />
          <Text style={{ color: '#555', fontSize: 14, marginTop: 12 }}>Loading trending tokens...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ color: '#FFF', fontWeight: '600', marginBottom: 8 }}>Failed to load tokens</Text>
          <Text style={{ color: '#555', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {String(error)}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ backgroundColor: '#141414', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.address}
          renderItem={({ item, index }) => (
            <TokenCard token={item} rank={index + 1} onPress={handleTokenPress} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#00FFA3"
              colors={['#00FFA3']}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
              <Text style={{ color: '#555', fontSize: 14 }}>No tokens found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
