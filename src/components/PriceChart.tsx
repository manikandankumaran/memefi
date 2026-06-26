import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { TokenBar } from '../types';

interface Props {
  bars: TokenBar[];
  color?: string;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PriceChart({ bars, color = '#00FFA3', height = 180 }: Props) {
  const data = useMemo(
    () => bars.map((b) => ({ value: b.close })),
    [bars],
  );

  if (!bars.length) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#555', fontSize: 14 }}>No chart data</Text>
      </View>
    );
  }

  return (
    <View style={{ overflow: 'hidden' }}>
      <LineChart
        data={data}
        width={SCREEN_WIDTH - 32}
        height={height}
        color={color}
        thickness={2}
        hideDataPoints
        areaChart
        startFillColor={color}
        endFillColor="transparent"
        startOpacity={0.15}
        endOpacity={0}
        initialSpacing={0}
        endSpacing={0}
        xAxisColor="transparent"
        yAxisColor="transparent"
        rulesColor="#1E1E1E"
        rulesType="solid"
        yAxisTextStyle={{ color: '#555', fontSize: 10 }}
        noOfSections={4}
        curved
        animateOnDataChange
        animationDuration={800}
        backgroundColor="transparent"
      />
    </View>
  );
}
