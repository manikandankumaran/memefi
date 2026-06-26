import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useWalletSetup } from '../../src/hooks/useWalletSetup';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, marginTop: 2, color: focused ? '#00FFA3' : '#555' }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  useWalletSetup();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" label="Trending" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💼" label="Portfolio" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
