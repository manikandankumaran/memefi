import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type { Token } from '../types';

interface Props {
  token: Token;
  rank?: number;
  onPress: (token: Token) => void;
}

function formatPrice(price: number): string {
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  if (price < 1) return `$${price.toFixed(6)}`;
  if (price < 1000) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export default function TokenCard({ token, rank, onPress }: Props) {
  const isUp = token.priceChange24h >= 0;
  const changeColor = isUp ? '#00C896' : '#FF4757';
  const changeBg = isUp ? 'rgba(0,200,150,0.1)' : 'rgba(255,71,87,0.1)';

  return (
    <TouchableOpacity
      onPress={() => onPress(token)}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' }}
    >
      {rank !== undefined && (
        <Text style={{ width: 24, fontSize: 12, color: '#555', marginRight: 12 }}>{rank}</Text>
      )}

      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' }}>
        {token.imageUrl ? (
          <Image source={{ uri: token.imageUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>{token.symbol.slice(0, 2)}</Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
          {token.symbol}
        </Text>
        <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {token.name}
        </Text>
        <Text style={{ color: '#555', fontSize: 11, marginTop: 1 }}>
          Vol {formatVolume(token.volume24h)}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: '#FFF', fontWeight: '500', fontSize: 14 }}>
          {formatPrice(token.price)}
        </Text>
        <View style={{ marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: changeBg }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: changeColor }}>
            {isUp ? '+' : ''}{token.priceChange24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
