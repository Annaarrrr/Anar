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
import { Mascot } from './Mascot';

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
        <Mascot 
          size={currentSlide.mascotType === 'welcome' ? 180 : 260} 
          variant={currentSlide.mascotType as any} 
        />
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
