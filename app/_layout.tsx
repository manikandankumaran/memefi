import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PrivyProvider } from '@privy-io/expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID ?? '';
const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? '';

export default function RootLayout() {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="token/[address]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
