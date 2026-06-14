import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppSettings } from '../../context/AppContext';

interface WashiTapeProps {
  style?: any;
  pressAnim?: Animated.Value;
}

export const WashiTape = React.memo(function WashiTape({ style, pressAnim }: WashiTapeProps) {
  const { colors, theme } = useAppSettings();

  const scaleX = pressAnim
    ? pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })
    : 1;
  const scaleY = pressAnim
    ? pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] })
    : 1;
  const rotate = pressAnim
    ? pressAnim.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '-4.5deg'] })
    : '-3deg';

  return (
    <Animated.View
      style={[
        styles.washiTape,
        {
          backgroundColor: theme === 'dark' ? 'rgba(160, 147, 255, 0.25)' : 'rgba(255, 159, 67, 0.35)', // glowing violet / amber tape
          borderColor: colors.border,
          transform: [{ rotate }, { scaleX }, { scaleY }],
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
});

export const Pushpin = React.memo(function Pushpin({ style }: { style?: any }) {
  const { colors } = useAppSettings();

  return (
    <View style={[styles.pinWrapper, style]} pointerEvents="none">
      <Svg width={22} height={22} viewBox="0 0 24 24">
        {/* Needle shadow */}
        <Path
          d="M 12 17 L 16 23"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Metal needle */}
        <Path
          d="M 12 16 L 12 22"
          stroke="#8E8E8E"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        {/* Pin plastic head body */}
        <Path
          d="M 12 2 C 9.8 2 8 3.8 8 6 C 8 8 10 9 10 13 L 6 15 L 6 16.5 L 18 16.5 L 18 15 L 14 13 C 14 9 16 8 16 6 C 16 3.8 14.2 2 12 2 Z"
          fill="#EF4444" // vibrant red pushpin
          stroke={colors.border}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Shine highlight curve */}
        <Path
          d="M 11.2 4 C 11.2 4 9.8 4.6 9.8 6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={0.8}
          opacity={0.65}
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  washiTape: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 68,
    height: 18,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    transform: [{ rotate: '-3deg' }],
    zIndex: 10,
  },
  pinWrapper: {
    position: 'absolute',
    top: -15,
    alignSelf: 'center',
    width: 22,
    height: 22,
    zIndex: 12,
  },
});
