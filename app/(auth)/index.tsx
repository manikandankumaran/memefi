import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePrivy, useLoginWithOAuth } from '@privy-io/expo';

export default function SignInScreen() {
  const router = useRouter();
  const { user } = usePrivy();
  const { login } = useLoginWithOAuth();

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  if (user) {
    router.replace('/(tabs)');
    return null;
  }

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      await login({ provider: 'google' });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (!msg.includes('cancel') && !msg.includes('dismiss')) {
        Alert.alert('Sign in failed', msg);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleApple = async () => {
    setLoadingApple(true);
    try {
      await login({ provider: 'apple' });
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (!msg.includes('cancel') && !msg.includes('dismiss')) {
        Alert.alert('Sign in failed', msg);
      }
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 24 }}>
      {/* Hero */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: '#141414', borderWidth: 1, borderColor: '#2A2A2A',
          alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        }}>
          <Text style={{ fontSize: 40 }}>🪙</Text>
        </View>

        <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1, marginBottom: 8 }}>
          MemeFi
        </Text>
        <Text style={{ color: '#666', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 48 }}>
          Trade Solana memecoins.{'\n'}Fast, simple, profitable.
        </Text>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 32, marginBottom: 0 }}>
          {[
            { label: 'Tokens', value: '50K+' },
            { label: 'Volume 24h', value: '$2B+' },
            { label: 'Traders', value: '100K+' },
          ].map((s) => (
            <View key={s.label} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>{s.value}</Text>
              <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={{ paddingBottom: 48, gap: 12 }}>
        {/* Google */}
        <TouchableOpacity
          onPress={handleGoogle}
          disabled={loadingGoogle}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16, gap: 12,
          }}
        >
          {loadingGoogle ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={{ fontSize: 20 }}>G</Text>
              <Text style={{ color: '#000', fontWeight: '600', fontSize: 16 }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple — iOS only */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            onPress={handleApple}
            disabled={loadingApple}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#141414', borderRadius: 16, paddingVertical: 16,
              borderWidth: 1, borderColor: '#2A2A2A', gap: 12,
            }}
          >
            {loadingApple ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ fontSize: 20 }}>🍎</Text>
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>
                  Continue with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <Text style={{ color: '#444', fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 18 }}>
          By continuing you agree to our Terms of Service.{'\n'}
          A self-custodial Solana wallet is created automatically.
        </Text>
      </View>
    </View>
  );
}
