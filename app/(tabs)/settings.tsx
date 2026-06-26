import React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrivy } from '@privy-io/expo';
import { useSolanaWallet } from '../../src/hooks/useWallet';
import { SOLANA_NETWORK } from '../../src/constants/config';

function SectionHeader({ label }: { label: string }) {
  return (
    <Text style={{ color: '#555', fontSize: 11, paddingHorizontal: 16, paddingBottom: 8, letterSpacing: 1.2, textTransform: 'uppercase' }}>
      {label}
    </Text>
  );
}

function Row({ label, value, onPress, danger }: { label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' }}
    >
      <Text style={{ fontSize: 14, fontWeight: '500', color: danger ? '#FF4757' : '#FFF' }}>{label}</Text>
      {value ? (
        <Text style={{ color: '#555', fontSize: 12, fontFamily: 'monospace' }}>{value}</Text>
      ) : onPress ? (
        <Text style={{ color: '#444', fontSize: 18 }}>›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout } = usePrivy();
  const { address: walletAddress } = useSolanaWallet();

  const truncate = (s: string | undefined) => (s ? `${s.slice(0, 6)}...${s.slice(-6)}` : '—');

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    Alert.alert('Wallet Address', walletAddress);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  // Extract email from linked accounts
  const email = user?.linked_accounts?.find(
    (a) => a.type === 'google_oauth' || a.type === 'apple_oauth'
  );
  const displayEmail = (email as { email?: string } | undefined)?.email ?? '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}>
        <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Wallet */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader label="Wallet" />
          <View style={{ backgroundColor: '#141414', marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E1E1E', overflow: 'hidden' }}>
            <Row label="Address" value={truncate(walletAddress ?? '')} onPress={handleCopyAddress} />
            <Row label="Network" value={SOLANA_NETWORK} />
          </View>
        </View>

        {/* Account */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader label="Account" />
          <View style={{ backgroundColor: '#141414', marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E1E1E', overflow: 'hidden' }}>
            <Row label="Email / Account" value={displayEmail} />
            <Row label="User ID" value={truncate(user?.id)} />
          </View>
        </View>

        {/* About */}
        <View style={{ marginBottom: 24 }}>
          <SectionHeader label="About" />
          <View style={{ backgroundColor: '#141414', marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E1E1E', overflow: 'hidden' }}>
            <Row label="Terms of Service" onPress={() => Linking.openURL('https://example.com/terms')} />
            <Row label="Privacy Policy" onPress={() => Linking.openURL('https://example.com/privacy')} />
            <Row label="Version" value="1.0.0 (devnet)" />
          </View>
        </View>

        {/* Sign out */}
        <View style={{ marginHorizontal: 16, marginBottom: 40 }}>
          <View style={{ backgroundColor: '#141414', borderRadius: 16, borderWidth: 1, borderColor: '#1E1E1E', overflow: 'hidden' }}>
            <Row label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
