import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

interface Props {
  size?: number; // Base body width is 150
  variant?: 'welcome' | 'stairs' | 'ready';
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    mascotWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      width: 260, // Keep wide base for stairs
      height: 260,
    },
    bulbBody: {
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: colors.accent,
      borderWidth: 4,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
      zIndex: 2,
    },
    bulbBodyMini: {
      width: 110,
      height: 110,
      borderRadius: 55,
      marginTop: -40,
    },
    bulbFace: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    bulbFaceReady: {
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 4,
    },
    eye: {
      width: 14,
      height: 36,
      borderRadius: 7,
      backgroundColor: colors.border,
      marginTop: -16,
    },
    eyeHappy: {
      height: 10,
      borderRadius: 5,
      borderWidth: 3.5,
      borderColor: colors.border,
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
      transform: [{ scaleY: -1 }],
      marginTop: -12,
    },
    blushCheek: {
      width: 16,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 159, 67, 0.45)', // glowing warm orange blush
      position: 'absolute',
    },
    bulbBase: {
      width: 66,
      height: 24,
      backgroundColor: colors.textMuted,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderWidth: 3,
      borderColor: colors.border,
      marginTop: -3,
      zIndex: 1,
    },
    bulbBaseMini: {
      width: 46,
      height: 18,
      backgroundColor: colors.textMuted,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      borderWidth: 2.5,
      borderColor: colors.border,
      marginTop: -2,
      zIndex: 1,
    },
    bulbTip: {
      width: 8,
      height: 18,
      backgroundColor: colors.accentAlt,
      borderRadius: 4,
      position: 'absolute',
      bottom: 22,
      zIndex: 0,
    },
    bulbTipMini: {
      width: 6,
      height: 14,
      backgroundColor: colors.accentAlt,
      borderRadius: 3,
      position: 'absolute',
      bottom: 60,
      zIndex: 0,
    },
    stairsWrapper: {
      width: 220,
      height: 110,
      position: 'absolute',
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'flex-end',
      zIndex: 0,
    },
    stairStep1: {
      width: 200,
      height: 30,
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    stairStep2: {
      width: 150,
      height: 30,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    stairStep3: {
      width: 100,
      height: 30,
      backgroundColor: colors.bgSecondary,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    starIcon: {
      fontSize: 44,
      position: 'absolute',
      top: 25,
      right: 35,
    },
    questionMark: {
      fontSize: 56,
      fontFamily: 'Cairo_700Bold',
      color: colors.accentAlt,
      position: 'absolute',
      top: 20,
      left: 35,
    },
    glassesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    glassesCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    glassesBridge: {
      width: 12,
      height: 3,
      backgroundColor: colors.border,
    },
    eyeReadyContainer: {
      flexDirection: 'row',
      gap: 32,
      position: 'absolute',
      top: 54,
    },
    eyeReady: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    smile: {
      width: 16,
      height: 8,
      borderWidth: 3,
      borderColor: colors.border,
      borderRadius: 8,
      borderTopWidth: 0,
      backgroundColor: 'transparent',
      marginTop: 6,
    },
    glowRing: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: colors.accent,
      zIndex: -1,
    },
    glowRingMini: {
      width: 110,
      height: 110,
      borderRadius: 55,
      marginTop: -40,
    },
  });
}

export function Mascot({ size = 150, variant = 'welcome' }: Props) {
  const { colors } = useAppSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Animation Refs
  const levitateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. levitation loop (gentle float)
    Animated.loop(
      Animated.sequence([
        Animated.timing(levitateAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(levitateAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. radiating glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const baseWidth = variant === 'welcome' ? 150 : 260;
  const scale = size / baseWidth;

  // Pulse interpolation for glowing ring (scale up, fade out)
  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0],
  });

  // Levitate translation
  const translateY = levitateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  const renderContent = () => {
    switch (variant) {
      case 'stairs':
        return (
          <View style={[styles.mascotWrapper, { width: 260, height: 260 }]}>
            {/* Glowing Ring */}
            <Animated.View
              style={[
                styles.glowRing,
                styles.glowRingMini,
                {
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                },
              ]}
            />
            <View style={[styles.bulbBody, styles.bulbBodyMini]}>
              <View style={styles.bulbFace}>
                <View style={[styles.eye, styles.eyeHappy]} />
                <View style={[styles.eye, styles.eyeHappy]} />
                {/* Blushing Cheeks */}
                <View style={[styles.blushCheek, { left: 24, top: 46 }]} />
                <View style={[styles.blushCheek, { right: 24, top: 46 }]} />
                <View style={[styles.smile, { position: 'absolute', top: 48 }]} />
              </View>
            </View>
            <View style={styles.bulbBaseMini} />
            <View style={styles.bulbTipMini} />
            {/* Styled staircase mockup */}
            <View style={styles.stairsWrapper}>
              <View style={styles.stairStep3} />
              <View style={styles.stairStep2} />
              <View style={styles.stairStep1} />
            </View>
            {/* Star */}
            <Text style={styles.starIcon}>⭐</Text>
          </View>
        );
      case 'ready':
        return (
          <View style={[styles.mascotWrapper, { width: 260, height: 260 }]}>
            {/* Glowing Ring */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                },
              ]}
            />
            <Text style={styles.questionMark}>؟</Text>
            <View style={styles.bulbBody}>
              <View style={[styles.bulbFace, styles.bulbFaceReady]}>
                <View style={styles.glassesContainer}>
                  <View style={styles.glassesCircle} />
                  <View style={styles.glassesBridge} />
                  <View style={styles.glassesCircle} />
                </View>
                <View style={styles.eyeReadyContainer}>
                  <View style={styles.eyeReady} />
                  <View style={styles.eyeReady} />
                </View>
                <View style={[styles.smile, { marginTop: 0 }]} />
                {/* Blushing Cheeks */}
                <View style={[styles.blushCheek, { left: 38, top: 76 }]} />
                <View style={[styles.blushCheek, { right: 38, top: 76 }]} />
              </View>
            </View>
            <View style={styles.bulbBase} />
            <View style={styles.bulbTip} />
          </View>
        );
      case 'welcome':
      default:
        return (
          <View style={[styles.mascotWrapper, { width: 150, height: 180 }]}>
            {/* Glowing Ring */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  transform: [{ scale: glowScale }],
                  opacity: glowOpacity,
                },
              ]}
            />
            <View style={styles.bulbBody}>
              <View style={styles.bulbFace}>
                <View style={styles.eye} />
                <View style={styles.eye} />
                {/* Blushing Cheeks */}
                <View style={[styles.blushCheek, { left: 26, top: 76 }]} />
                <View style={[styles.blushCheek, { right: 26, top: 76 }]} />
                {/* Smile */}
                <View style={[styles.smile, { position: 'absolute', top: 76 }]} />
              </View>
            </View>
            <View style={styles.bulbBase} />
            <View style={styles.bulbTip} />
          </View>
        );
    }
  };

  const containerWidth = size;
  const containerHeight = variant === 'welcome' ? size * 1.2 : size;

  return (
    <View style={{ width: containerWidth, height: containerHeight, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={[{ transform: [{ scale }, { translateY }] }, { position: 'absolute' }]}>
        {renderContent()}
      </Animated.View>
    </View>
  );
}
