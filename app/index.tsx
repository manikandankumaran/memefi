import { Redirect } from 'expo-router';
import { usePrivy } from '@privy-io/expo';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isReady, user } = usePrivy();

  if (!isReady) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#00FFA3" size="large" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/(auth)'} />;
}
