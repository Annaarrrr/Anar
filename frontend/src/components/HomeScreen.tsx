import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { CustomAlert as Alert } from './common/Alert';
import {
  BellIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatIcon,
  ZapIcon,
  TargetIcon,
  TrendingUpIcon,
  CheckIcon,
} from './common/CustomIcons';
import { SketchButton } from './common/SketchButton';
import { WashiTape, Pushpin } from './common/PinOrnaments';
import { HighlighterBadge } from './common/HighlighterBadge';
import { CornerFold } from './common/CornerFold';
import { ActiveTab, Goal, Task } from '../types';
import { useAppSettings } from '../context/AppContext';
import { Mascot } from './Mascot';

interface Props {
  onNavigate:     (s: ActiveTab) => void;
  activeGoal:     Goal | null;
  tasks:          Task[];
  onLogout:       () => void | Promise<void>;
  onOpenSettings: () => void;
  active?:        boolean;
}

interface HomeStatCardProps {
  rotate: string;
  washiColor?: string;
  iconBg: string;
  icon: React.ReactNode;
  value: string | number;
  valueColor: string;
  label: string;
  styles: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HomeStatCard = React.memo(({
  rotate,
  washiColor,
  iconBg,
  icon,
  value,
  valueColor,
  label,
  styles,
}: HomeStatCardProps) => {
  const wiggleAnim = React.useRef(new Animated.Value(0)).current;
  const directionRef = React.useRef(1);

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

  const rotateVal = wiggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [rotate, `${parseFloat(rotate) + directionRef.current * 3}deg`],
  });

  const scale = wiggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.statCard,
        {
          transform: [{ rotate: rotateVal }, { scale }],
        }
      ]}
    >
      <WashiTape style={{ top: -8, ...(washiColor ? { backgroundColor: washiColor } : {}) }} />
      <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AnimatedPressable>
  );
});
HomeStatCard.displayName = 'HomeStatCard';

function HomeScreenInner({
  onNavigate,
  activeGoal,
  tasks,
  onLogout,
  onOpenSettings,
  active = false,
}: Props) {
  const { colors, t, language } = useAppSettings();
  const isRTL = language === 'ar';
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  // Frozen data that only updates when active === true
  const [frozenData, setFrozenData] = React.useState({
    activeGoal,
    tasks,
    completedCount: tasks.filter((tk) => tk.completed).length,
    totalCount: tasks.length,
    progressPercent: tasks.length > 0 ? Math.round((tasks.filter((tk) => tk.completed).length / tasks.length) * 100) : 0,
  });

  React.useEffect(() => {
    if (active) {
      const completed = tasks.filter((tk) => tk.completed).length;
      const total = tasks.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      setFrozenData({
        activeGoal,
        tasks,
        completedCount: completed,
        totalCount: total,
        progressPercent: pct,
      });
    }
  }, [active, activeGoal, tasks]);

  // New goal wiggles
  const newGoalWiggle = React.useRef(new Animated.Value(0)).current;
  const newGoalDir = React.useRef(1);

  const handleNewGoalPressIn = () => {
    newGoalDir.current = Math.random() > 0.5 ? 1 : -1;
    Animated.spring(newGoalWiggle, {
      toValue: 1,
      useNativeDriver: true,
      tension: 160,
      friction: 10,
    }).start();
  };

  const handleNewGoalPressOut = () => {
    Animated.spring(newGoalWiggle, {
      toValue: 0,
      useNativeDriver: true,
      tension: 160,
      friction: 10,
    }).start();
  };

  const newGoalRotate = newGoalWiggle.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${newGoalDir.current * 1.5}deg`],
  });

  const newGoalScale = newGoalWiggle.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  const {
    activeGoal: displayActiveGoal,
    completedCount,
    totalCount,
    progressPercent,
  } = frozenData;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? (isRTL ? '☀️ صباح الخير' : 'Good Morning ☀️') :
    hour < 18 ? (isRTL ? '🌤 مساء الخير'  : 'Good Afternoon 🌤') :
                (isRTL ? '🌙 مساء النور'  : 'Good Evening 🌙');

  const dayStr = new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* ── Safe area ── */}
      <View style={styles.safeTop} />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => Alert.alert(
            isRTL ? 'إشعارات' : 'Notifications',
            isRTL ? 'لا يوجد إشعارات جديدة' : 'No new notifications'
          )}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <BellIcon size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.greetBlock}>
          <Text style={styles.greetDate} numberOfLines={1}>{dayStr}</Text>
          <Text style={styles.greetText} numberOfLines={1}>{greeting}</Text>
        </View>

        <TouchableOpacity onPress={onOpenSettings} style={styles.avatarBtn} activeOpacity={0.7}>
          <Text style={styles.avatarLetter}>{isRTL ? 'م' : 'U'}</Text>
          <View style={styles.avatarOnlineDot} />
        </TouchableOpacity>
      </View>

      {/* ── Mascot hint banner ── */}
      <View style={styles.mascotRow}>
        <Mascot size={46} animated={active} />
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{t.home_mascot_msg}</Text>
        </View>
      </View>

      {/* ── Main content (fills remaining space) ── */}
      <View style={styles.main}>

        {!displayActiveGoal ? (
          /* ── Empty state ── */
          <View style={styles.emptyCard}>
            <Mascot size={80} animated={active} />
            <Text style={styles.emptyTitle}>
              {isRTL ? 'ابدأ رحلتك الآن 🚀' : 'Start Your Journey 🚀'}
            </Text>
            <Text style={styles.emptyHint}>{t.home_welcome_msg}</Text>
            
            <View style={{ width: '100%', marginTop: 8 }}>
              <SketchButton
                onPress={() => onNavigate('chat')}
                variant="primary"
              >
                <View style={styles.emptyCtaContent}>
                  <Text style={styles.emptyCtaText}>{t.home_cta_btn}</Text>
                  <ChatIcon size={18} color="#FFFFFF" />
                </View>
              </SketchButton>
            </View>
          </View>

        ) : (
          <>
            {/* ── Stats row ── */}
            <View style={styles.statsRow}>
              <HomeStatCard
                rotate="-1.5deg"
                washiColor="rgba(135, 121, 245, 0.25)"
                iconBg={colors.accentAlt + '20'}
                icon={<CheckIcon size={16} color={colors.accentAlt} />}
                value={completedCount}
                valueColor={colors.accentAlt}
                label={t.home_stat_tasks}
                styles={styles}
              />

              <HomeStatCard
                rotate="1.2deg"
                iconBg={colors.accent + '20'}
                icon={<TrendingUpIcon size={16} color={colors.accent} />}
                value={`${progressPercent}%`}
                valueColor={colors.accent}
                label={isRTL ? 'التقدم' : 'Progress'}
                styles={styles}
              />

              <HomeStatCard
                rotate="-0.8deg"
                washiColor="rgba(101, 83, 74, 0.25)"
                iconBg={colors.textSecondary + '20'}
                icon={<TargetIcon size={16} color={colors.textSecondary} />}
                value={totalCount}
                valueColor={colors.textSecondary}
                label={isRTL ? 'مهمة' : 'Total'}
                styles={styles}
              />
            </View>

            {/* ── Hero goal card (flex: 1 → takes remaining space) ── */}
            <View style={styles.heroCard}>
              <Pushpin style={{ top: -14 }} />
              <CornerFold size={20} />
              {/* Badge */}
              <View style={styles.heroBadgeRow}>
                <HighlighterBadge
                  text={t.home_goal_active}
                  textColor={colors.accent}
                  highlightColor={colors.accentAlt + '20'}
                />
              </View>

              {/* Goal text */}
              <Text
                style={[styles.heroGoalText, { textAlign: isRTL ? 'right' : 'left' }]}
                numberOfLines={3}
              >
                {displayActiveGoal.text}
              </Text>

              {/* Spacer pushes progress + footer to bottom */}
              <View style={{ flex: 1 }} />

              {/* Progress bar */}
              <View style={styles.heroProgressRow}>
                <View style={styles.heroProgressTrack}>
                  <View style={[styles.heroProgressFill, { width: `${progressPercent}%` as any }]} />
                </View>
                <Text style={styles.heroProgressPct}>{progressPercent}%</Text>
              </View>

              {/* Footer */}
              <View style={styles.heroFooter}>
                <Text style={styles.heroTaskCount}>
                  {completedCount} {t.home_tasks_done.replace('{t}', String(totalCount))}
                </Text>

                <View style={{ width: 140 }}>
                  <SketchButton
                    onPress={() => onNavigate('vision')}
                    variant="primary"
                    style={{ height: 40 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.heroBtnText}>{t.home_view_tasks}</Text>
                      {isRTL
                        ? <ArrowLeftIcon  size={13} color="#FFFFFF" />
                        : <ArrowRightIcon size={13} color="#FFFFFF" />}
                    </View>
                  </SketchButton>
                </View>
              </View>
            </View>

            {/* ── New goal CTA ── */}
            <Pressable
              onPress={() => onNavigate('chat')}
              onPressIn={handleNewGoalPressIn}
              onPressOut={handleNewGoalPressOut}
              style={{ width: '100%' }}
            >
              <Animated.View style={[styles.newGoalCard, { transform: [{ rotate: newGoalRotate }, { scale: newGoalScale }] }]}>
                <View>
                  <Text style={[styles.newGoalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {t.home_new_goal}
                  </Text>
                  <Text style={[styles.newGoalHint, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'حدد هدفاً جديداً ←' : 'Set a new one →'}
                  </Text>
                </View>
                <View style={styles.newGoalArrow}>
                  <PlusIcon size={18} color="#FFFFFF" />
                </View>
              </Animated.View>
            </Pressable>
          </>
        )}
      </View>

      {/* Bottom padding for tab bar */}
      <View style={styles.safeBottom} />
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    safeTop:    { height: Platform.OS === 'ios' ? 54 : 20 },
    safeBottom: { height: 86 },  // clears the tab bar

    /* ── Top bar ── */
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    iconBtn: {
      width: 42, height: 42, borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 2, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.border,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1, shadowRadius: 0,
      elevation: 2,
    },
    greetBlock: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    greetDate:  {
      fontSize: 10,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textMuted,
      letterSpacing: 0.4,
      textAlign: 'center',
      width: '100%',
      lineHeight: 14,
    },
    greetText:  {
      fontSize: 16,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
      textAlign: 'center',
      width: '100%',
      lineHeight: 22,
    },
    avatarBtn: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: colors.accent,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.border,
      shadowColor: colors.border, shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 3,
    },
    avatarLetter:    { fontSize: 17, fontFamily: 'Cairo_700Bold', color: '#FFFFFF' },
    avatarOnlineDot: {
      position: 'absolute', bottom: -1, right: -1,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: colors.accentAlt,
      borderWidth: 2, borderColor: colors.border,
    },

    /* ── Mascot banner ── */
    mascotRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 20, marginBottom: 18,
    },
    speechBubble: {
      flex: 1, backgroundColor: colors.surface,
      borderRadius: 16, borderTopLeftRadius: 4,
      paddingVertical: 10, paddingHorizontal: 14,
      borderWidth: 2, borderColor: colors.border,
      shadowColor: colors.border,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1, shadowRadius: 0,
      elevation: 2,
    },
    speechText: {
      fontSize: 12, fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary, lineHeight: 20, textAlign: 'right',
    },

    /* ── Main flex area ── */
    main: {
      flex: 1,
      paddingHorizontal: 20,
    },

    /* ── Empty state ── */
    emptyCard: {
      flex: 1, backgroundColor: colors.surface, borderRadius: 18,
      padding: 30, alignItems: 'center', justifyContent: 'center', gap: 16,
      borderWidth: 2.5, borderColor: colors.border,
      shadowColor: colors.border,
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 1, shadowRadius: 0,
      elevation: 4,
    },
    emptyTitle:  { fontSize: 18, fontFamily: 'Cairo_700Bold', color: colors.textPrimary, textAlign: 'center' },
    emptyHint:   { fontSize: 13, fontFamily: 'Cairo_600SemiBold', color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    emptyCtaText: { fontSize: 15, fontFamily: 'Cairo_700Bold', color: '#FFFFFF' },
    emptyCtaContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    /* ── Stats ── */
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statCard: {
      flex: 1, backgroundColor: colors.surface, borderRadius: 14,
      padding: 12, alignItems: 'center', gap: 5, borderWidth: 2, borderColor: colors.border,
      shadowColor: colors.border, shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 3,
    },
    statIconBox: {
      width: 32, height: 32, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', marginBottom: 2,
      borderWidth: 1.5, borderColor: colors.border,
    },
    statValue: { fontSize: 18, fontFamily: 'Cairo_700Bold' },
    statLabel: { fontSize: 9, fontFamily: 'Cairo_700Bold', color: colors.textMuted, letterSpacing: 0.4, textAlign: 'center' },

    /* ── Hero card ── */
    heroCard: {
      flex: 1,                       // takes all remaining vertical space
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 20,
      marginBottom: 14,
      borderWidth: 2.5, borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: colors.border, shadowOffset: { width: 5, height: 5 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },
    heroBadgeRow: { alignItems: 'flex-end', marginBottom: 12 },
    heroBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: colors.bgSecondary, borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 3,
      borderWidth: 1.5, borderColor: colors.border,
    },
    heroBadgeText: { fontSize: 10, fontFamily: 'Cairo_700Bold', color: colors.textPrimary, letterSpacing: 0.5 },
    heroGoalText: {
      fontSize: 18, fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary, lineHeight: 30,
    },
    heroProgressRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18,
    },
    heroProgressTrack: {
      flex: 1, height: 10, backgroundColor: colors.bgSecondary, borderRadius: 5, overflow: 'hidden',
      borderWidth: 1.5, borderColor: colors.border,
    },
    heroProgressFill: {
      height: '100%', backgroundColor: colors.accent, borderRadius: 5,
    },
    heroProgressPct: {
      fontSize: 13, fontFamily: 'Cairo_700Bold', color: colors.textPrimary, minWidth: 38, textAlign: 'right',
    },
    heroFooter: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    heroTaskCount: { fontSize: 12, fontFamily: 'Cairo_600SemiBold', color: colors.textSecondary },
    heroBtnText: { fontSize: 12, fontFamily: 'Cairo_700Bold', color: '#FFFFFF' },

    /* ── New goal CTA ── */
    newGoalCard: {
      borderRadius: 14, borderWidth: 2,
      borderStyle: 'dashed', borderColor: colors.border,
      backgroundColor: colors.bgSecondary,
      paddingVertical: 12, paddingHorizontal: 16,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    newGoalTitle: { fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary, marginBottom: 2 },
    newGoalHint:  { fontSize: 12, fontFamily: 'Cairo_700Bold', color: colors.accent },
    newGoalArrow: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.border,
      shadowColor: colors.border, shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 2,
    },
  });
}

export const HomeScreen = React.memo(HomeScreenInner);
