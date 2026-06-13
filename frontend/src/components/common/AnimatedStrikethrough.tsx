import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppSettings } from '../../context/AppContext';

interface Props {
  visible: boolean;
  color?: string;
  style?: any;
}

export function AnimatedStrikethrough({ visible, color, style }: Props) {
  const { colors, language } = useAppSettings();
  const isRTL = language === 'ar';
  const strokeColor = color || colors.accent;
  
  const [width, setWidth] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start();
    } else {
      animValue.setValue(0);
    }
  }, [visible]);

  // If not checked, render an empty view to measure the text container width
  if (!visible || width === 0) {
    return (
      <View
        style={StyleSheet.absoluteFillObject}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        pointerEvents="none"
      />
    );
  }

  // Draw a wavy hand-drawn strike line
  const steps = 12;
  let d = isRTL ? `M ${width} 8` : `M 0 8`;
  
  for (let i = 1; i <= steps; i++) {
    const frac = i / steps;
    const x = isRTL ? width - frac * width : frac * width;
    
    // Wave oscillation with micro jitter to make it look organic
    const baseWave = Math.sin(frac * Math.PI * 3.5) * 1.6;
    const jitter = (i % 2 === 0 ? 0.35 : -0.35);
    const y = 8 + baseWave + jitter;
    
    d += ` L ${x} ${y}`;
  }

  const length = width;
  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [length, 0],
  });

  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center' }, style]} pointerEvents="none">
      <Svg width={width} height={16}>
        <AnimatedPath
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${length} ${length}`}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
    </View>
  );
}
