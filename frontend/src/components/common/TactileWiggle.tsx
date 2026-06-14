import React, { useRef } from 'react';
import { Pressable, Animated, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const TactileWiggle = React.memo(function TactileWiggle({ children, style }: Props) {
  const wiggleAnim = useRef(new Animated.Value(0)).current;

  // Track wiggle direction randomly per press
  const directionRef = useRef(1);

  const handlePressIn = () => {
    directionRef.current = Math.random() > 0.5 ? 1 : -1;
    Animated.spring(wiggleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 160,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(wiggleAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 160,
      friction: 10,
    }).start();
  };

  const rotate = wiggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${directionRef.current * 3}deg`],
  });

  const scale = wiggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
});
