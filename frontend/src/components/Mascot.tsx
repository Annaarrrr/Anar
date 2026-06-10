import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      borderWidth: 5,
      borderColor: colors.bg,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 15,
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
    },
    bulbFaceReady: {
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 8,
    },
    eye: {
      width: 16,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.accentAlt,
    },
    eyeHappy: {
      height: 10,
      borderRadius: 5,
      borderWidth: 3,
      borderColor: colors.accentAlt,
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
      transform: [{ scaleY: -1 }],
    },
    bulbBase: {
      width: 70,
      height: 25,
      backgroundColor: colors.textMuted,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      borderWidth: 3,
      borderColor: colors.bg,
      marginTop: -3,
      zIndex: 1,
    },
    bulbBaseMini: {
      width: 50,
      height: 18,
      backgroundColor: colors.textMuted,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      borderWidth: 2,
      borderColor: colors.bg,
      marginTop: -2,
      zIndex: 1,
    },
    bulbTip: {
      width: 8,
      height: 20,
      backgroundColor: colors.accent,
      borderRadius: 4,
      position: 'absolute',
      bottom: 25,
      zIndex: 0,
    },
    bulbTipMini: {
      width: 6,
      height: 14,
      backgroundColor: colors.accent,
      borderRadius: 3,
      position: 'absolute',
      bottom: 65,
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
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    stairStep2: {
      width: 150,
      height: 30,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    stairStep3: {
      width: 100,
      height: 30,
      backgroundColor: colors.border,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    starIcon: {
      fontSize: 48,
      position: 'absolute',
      top: 25,
      right: 35,
    },
    questionMark: {
      fontSize: 64,
      fontFamily: 'Cairo_700Bold',
      color: colors.accentAlt,
      position: 'absolute',
      top: 15,
      left: 35,
    },
    glassesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    glassesCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 3,
      borderColor: colors.bg,
      backgroundColor: 'transparent',
    },
    glassesBridge: {
      width: 12,
      height: 3,
      backgroundColor: colors.bg,
    },
    eyeReadyContainer: {
      flexDirection: 'row',
      gap: 36,
      position: 'absolute',
      top: 58,
    },
    eyeReady: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accentAlt,
    },
    smile: {
      width: 20,
      height: 10,
      borderWidth: 3,
      borderColor: colors.accentAlt,
      borderRadius: 10,
      borderTopWidth: 0,
      backgroundColor: 'transparent',
      marginTop: -8,
    },
  });
}

export function Mascot({ size = 150, variant = 'welcome' }: Props) {
  const { colors } = useAppSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  
  // The original mascot wrapper was 260x260 to fit props. We scale down from that.
  // Wait, if we use 260x260, the bounding box for chat avatars will be 260 * scale!
  // It's better if `welcome` just has a tight bounding box.
  // But wait! If we do bounding box based on variant:
  const baseWidth = variant === 'welcome' ? 150 : 260;
  const scale = size / baseWidth;

  const renderContent = () => {
    switch (variant) {
      case 'stairs':
        return (
          <View style={[styles.mascotWrapper, { width: 260, height: 260 }]}>
            <View style={[styles.bulbBody, styles.bulbBodyMini]}>
              <View style={styles.bulbFace}>
                <View style={[styles.eye, styles.eyeHappy]} />
                <View style={[styles.eye, styles.eyeHappy]} />
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
                <View style={styles.smile} />
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
            <View style={styles.bulbBody}>
              <View style={styles.bulbFace}>
                <View style={styles.eye} />
                <View style={styles.eye} />
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
      <View style={[{ transform: [{ scale }] }, { position: 'absolute' }]}>
        {renderContent()}
      </View>
    </View>
  );
}
