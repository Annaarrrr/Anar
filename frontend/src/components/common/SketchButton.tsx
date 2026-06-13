import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Animated,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAppSettings } from '../../context/AppContext';

interface Props {
  onPress: () => void;
  children?: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'accentAlt';
  disabled?: boolean;
}

export function SketchButton({
  onPress,
  children,
  title,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
}: Props) {
  const { colors } = useAppSettings();

  // Animation values
  const pressAnim = useRef(new Animated.Value(0)).current; // 0 to 1

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(pressAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Interpolations for tactile press
  // Translate the front card by +3px in X and Y (moving it closer to the shadow)
  const translateX = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });
  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });
  // Shrink ever so slightly
  const scale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97],
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'accentAlt':
        return {
          bg: colors.accentAlt,
          text: '#FFFFFF',
          shadow: colors.border,
        };
      case 'secondary':
        return {
          bg: colors.surface,
          text: colors.textPrimary,
          shadow: colors.border,
        };
      case 'primary':
      default:
        return {
          bg: colors.accent,
          text: '#FFFFFF',
          shadow: colors.border,
        };
    }
  };

  const themeVars = getVariantStyles();

  return (
    <View style={[styles.container, style]}>
      {/* ── Outer Offset Shadow (Hard Vector) ── */}
      <View
        style={[
          styles.shadow,
          {
            backgroundColor: themeVars.shadow,
            borderRadius: 14,
            opacity: disabled ? 0.3 : 1,
          },
        ]}
      />

      {/* ── Animating Button Face ── */}
      <Animated.View
        style={[
          styles.buttonFace,
          {
            backgroundColor: themeVars.bg,
            borderColor: colors.border,
            borderWidth: 2,
            borderRadius: 14,
            transform: [{ translateX }, { translateY }, { scale }],
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Pressable
          onPress={disabled ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressable}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          {children ? (
            children
          ) : (
            <Text style={[styles.text, { color: themeVars.text }, textStyle]}>
              {title}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 52,
    alignSelf: 'stretch',
    marginBottom: 6, // space for the shadow offset
  },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
  },
  buttonFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
  },
});
