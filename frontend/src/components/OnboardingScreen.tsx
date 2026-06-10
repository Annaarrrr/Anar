import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    /* ── Background blobs ── */
    bgPurple: {
      position: 'absolute',
      top: -80, right: -60,
      width: 280, height: 280, borderRadius: 140,
      backgroundColor: colors.accent, opacity: 0.07,
    },
    bgTeal: {
      position: 'absolute',
      bottom: 160, left: -80,
      width: 240, height: 240, borderRadius: 120,
      backgroundColor: colors.accentAlt, opacity: 0.05,
    },
    topBar: {
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      zIndex: 10,
    },
    skipBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    skipText: {
      fontSize: 13,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textSecondary,
    },
    centerSection: {
      flex: 1.2,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    mascotContainer: {
      width: 260,
      height: 260,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
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
      top: 35,
      zIndex: 0,
    },
    bulbTipMini: {
      width: 6,
      height: 14,
      backgroundColor: colors.accent,
      borderRadius: 3,
      position: 'absolute',
      top: 58,
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
    contentSection: {
      flex: 0.8,
      alignItems: 'center',
      paddingHorizontal: 32,
      justifyContent: 'center',
      zIndex: 10,
    },
    title: {
      fontSize: 22,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 34,
    },
    description: {
      fontSize: 14,
      fontFamily: 'Cairo_400Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 22,
    },
    bottomSection: {
      paddingBottom: 40,
      alignItems: 'center',
      gap: 24,
      zIndex: 10,
    },
    paginator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.borderLight,
    },
    activeDot: {
      width: 24,
      backgroundColor: colors.accentAlt,
    },
    nextBtn: {
      backgroundColor: colors.accentAlt,
      borderRadius: 14,
      height: 52,
      width: width - 48,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accentAlt,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
    nextBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontFamily: 'Cairo_700Bold',
    },
  });
}

export function OnboardingScreen({ onFinish }: Props) {
  const { colors, language } = useAppSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [step, setStep] = useState(0);
  const isRTL = language === 'ar';

  const slides = [
    {
      title: isRTL ? 'أهلاً بك في أنار' : 'Welcome to Anar',
      description: isRTL ? 'حيث تتحول الأفكار إلى خطة' : 'Where ideas become plans',
      mascotType: 'welcome',
      skipSide: 'left',
    },
    {
      title: isRTL ? 'خطوة صغيرة كل يوم تصنع الفرق' : 'Small steps make a difference',
      description: isRTL ? 'تتبع إنجازاتك اليومية واحتفل بنجاحاتك مع أنار في كل خطوة' : 'Track your daily progress and celebrate your successes.',
      mascotType: 'stairs',
      skipSide: 'right',
    },
    {
      title: isRTL ? 'هل أنت مستعد لاكتشاف قدراتك؟' : 'Ready to discover your potential?',
      description: isRTL ? 'أنار هنا ليرشدك في كل خطوة' : 'Anar is here to guide you every step of the way.',
      mascotType: 'ready',
      skipSide: 'none',
    },
  ];

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const currentSlide = slides[step];

  // Helper to render the bulb robot mascot with styled views
  const renderMascot = (type: string) => {
    switch (type) {
      case 'welcome':
        return (
          <View style={styles.mascotContainer}>
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
      case 'stairs':
        return (
          <View style={styles.mascotContainer}>
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
      default:
        return (
          <View style={styles.mascotContainer}>
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background glow blobs */}
      <View style={styles.bgPurple} />
      <View style={styles.bgTeal} />

      {/* Top Bar for Skip */}
      <View style={styles.topBar}>
        {currentSlide.skipSide === 'left' && (
          <TouchableOpacity onPress={onFinish} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>{isRTL ? 'تخطي' : 'Skip'}</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {currentSlide.skipSide === 'right' && (
          <TouchableOpacity onPress={onFinish} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>{isRTL ? 'تخطي' : 'Skip'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Center Mascot Image */}
      <View style={styles.centerSection}>
        {renderMascot(currentSlide.mascotType)}
      </View>

      {/* Copy / Typography */}
      <View style={styles.contentSection}>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomSection}>
        {/* Paginator dots (Dynamic direction) */}
        <View style={[styles.paginator, !isRTL && { flexDirection: 'row' }]}>
          <View style={[styles.dot, step === (isRTL ? 2 : 0) && styles.activeDot]} />
          <View style={[styles.dot, step === 1 && styles.activeDot]} />
          <View style={[styles.dot, step === (isRTL ? 0 : 2) && styles.activeDot]} />
        </View>

        {/* Action Button */}
        <TouchableOpacity onPress={handleNext} style={styles.nextBtn} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>
            {step === 2 
              ? (isRTL ? 'ابدأ الآن' : 'Get Started') 
              : (isRTL ? 'التالي ←' : 'Next →')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
