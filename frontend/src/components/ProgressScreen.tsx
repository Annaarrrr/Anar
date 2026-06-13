import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { TrendingUpIcon, TargetIcon, CheckIcon, ZapIcon } from './common/CustomIcons';
import { GoalPin, Task } from '../types';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  goals: GoalPin[];
  tasks: Task[];
  active?: boolean;
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    safeTop: { height: Platform.OS === 'ios' ? 54 : 30 },

    /* ── Top bar ── */
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 20,
      zIndex: 10,
    },
    greetBlock: { gap: 2 },
    greetDate: {
      fontSize: 11,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textMuted,
    },
    headerTitle: {
      fontSize: 22,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    headerBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    headerBadgeText: {
      fontSize: 11,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },

    /* ── Stat row ── */
    statRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      gap: 6,
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: colors.border,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    statValue: {
      fontSize: 22,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
      marginTop: 4,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: 'Cairo_700Bold',
      color: colors.textMuted,
      textAlign: 'center',
    },

    /* ── Metric cards (Horizontal) ── */
    chartsScroll: {
      flexGrow: 0,
      marginBottom: 20,
    },
    chartsContent: {
      paddingHorizontal: 20,
      gap: 16,
      paddingBottom: 10,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: colors.border,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    cardTitle: {
      fontSize: 14,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    cardBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: colors.bg,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    cardBadgeText: {
      fontSize: 10,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },

    /* Ring chart */
    ringWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      height: 150,
    },
    ringTextCenter: {
      position: 'absolute',
      alignItems: 'center',
    },
    ringPct: {
      fontSize: 28,
      fontFamily: 'Cairo_700Bold',
      color: colors.accentAlt,
    },
    ringLabel: {
      fontSize: 11,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textMuted,
    },
    ringLegendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginTop: 14,
    },
    ringLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    ringLegendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    ringLegendText: {
      fontSize: 11,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textSecondary,
    },

    /* Line chart */
    lineLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
      paddingHorizontal: 4,
    },
    lineLabel: {
      fontSize: 10,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textMuted,
    },

    /* ── Goals list ── */
    goalsSection: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 2.5,
      borderColor: colors.border,
      shadowColor: colors.border,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 5,
      marginHorizontal: 20,
      marginBottom: 30,
      overflow: 'hidden',
    },
    goalsHeader: {
      paddingHorizontal: 24,
      paddingVertical: 18,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    goalsHeaderTitle: {
      fontSize: 15,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    goalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.borderLight,
      gap: 12,
    },
    goalRowLast: {
      borderBottomWidth: 0,
    },
    goalEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
    goalInfo:  { flex: 1, gap: 6 },
    goalName: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    goalBarTrack: {
      height: 8,
      backgroundColor: colors.bg,
      borderRadius: 4,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    goalBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    goalPct: {
      fontSize: 12,
      fontFamily: 'Cairo_700Bold',
      color: colors.textSecondary,
      minWidth: 36,
      textAlign: 'right',
    },

    // Empty state
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 10,
    },
    emptyEmoji: { fontSize: 40 },
    emptyTitle: {
      fontSize: 16,
      fontFamily: 'Cairo_700Bold',
      color: colors.textSecondary,
    },
    emptyText: {
      fontSize: 13,
      fontFamily: 'Cairo_400Regular',
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}

import { HighlighterBadge } from './common/HighlighterBadge';

interface ProgressStatCardProps {
  icon: React.ReactNode;
  value: string | number;
  valueColor?: string;
  label: string;
  styles: any;
  rotate: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ProgressStatCard = React.memo(({ icon, value, valueColor, label, styles, rotate }: ProgressStatCardProps) => {
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
      {icon}
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AnimatedPressable>
  );
});
ProgressStatCard.displayName = 'ProgressStatCard';

interface ProgressChartCardProps {
  children: React.ReactNode;
  styles: any;
  width: number;
}

const ProgressChartCard = React.memo(({ children, styles, width }: ProgressChartCardProps) => {
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
    outputRange: ['0deg', `${directionRef.current * 1.5}deg`],
  });

  const scale = wiggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ rotate: rotateVal }, { scale }],
            width: '100%',
          }
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
});
ProgressChartCard.displayName = 'ProgressChartCard';

interface GoalProgressRowProps {
  goal: {
    id: string;
    emoji: string;
    text: string;
    pct: number;
    pinColor: string;
  };
  isLast: boolean;
  styles: any;
  active: boolean;
}

const GoalProgressRow = React.memo(({ goal, isLast, styles, active }: GoalProgressRowProps) => {
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim  = useRef(new Animated.Value(0)).current;
  const barAnim    = useRef(new Animated.Value(0)).current;
  const directionRef = useRef(1);

  // Animate bar fill whenever screen becomes active
  useEffect(() => {
    if (active) {
      barAnim.setValue(0);
      Animated.timing(barAnim, {
        toValue: goal.pct,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width requires layout driver
      }).start();
    }
  }, [active, goal.pct]);

  const handlePressIn = () => {
    directionRef.current = Math.random() > 0.5 ? 1 : -1;
    Animated.parallel([
      Animated.spring(wiggleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 160,
        friction: 10,
      }),
      Animated.sequence([
        Animated.timing(emojiAnim, {
          toValue: -6,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(emojiAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
      ]),
    ]).start();
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
    outputRange: ['0deg', `${directionRef.current * 1.5}deg`],
  });
  const scaleVal = wiggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97],
  });

  const barWidth = barAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.goalRow,
          isLast && styles.goalRowLast,
          { transform: [{ rotate: rotateVal }, { scale: scaleVal }] },
        ]}
      >
        <Animated.Text
          style={[styles.goalEmoji, { transform: [{ translateY: emojiAnim }] }]}
        >
          {goal.emoji}
        </Animated.Text>
        <View style={styles.goalInfo}>
          <Text style={styles.goalName} numberOfLines={1}>{goal.text}</Text>
          <View style={styles.goalBarTrack}>
            <Animated.View
              style={[
                styles.goalBarFill,
                { width: barWidth, backgroundColor: goal.pinColor },
              ]}
            />
          </View>
        </View>
        <Text style={styles.goalPct}>{goal.pct}%</Text>
      </Animated.View>
    </Pressable>
  );
});
GoalProgressRow.displayName = 'GoalProgressRow';

function ProgressScreenInner({ goals, tasks, active = false }: Props) {
  const { colors, t, language } = useAppSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isRTL = language === 'ar';

  // Entrance slide-up when tab activates
  const slideAnim   = useRef(new Animated.Value(12)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const sectionAnim = useRef(new Animated.Value(16)).current;
  const sectionFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      // Header slides in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
      // Goals section slides in with a small delay
      Animated.parallel([
        Animated.timing(sectionAnim, {
          toValue: 0,
          duration: 300,
          delay: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sectionFade, {
          toValue: 1,
          duration: 300,
          delay: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(12);
      fadeAnim.setValue(0);
      sectionAnim.setValue(16);
      sectionFade.setValue(0);
    }
  }, [active]);

  const [frozenData, setFrozenData] = useState({
    goals,
    tasks,
  });

  useEffect(() => {
    if (active) {
      setFrozenData({ goals, tasks });
    }
  }, [active, goals, tasks]);

  const { goals: displayGoals } = frozenData;

  // ── Real computed stats ──
  const totalGoals     = displayGoals.length;
  const totalTasks     = displayGoals.reduce((sum, g) => sum + g.tasks.length, 0);
  const completedTasks = displayGoals.reduce((sum, g) => sum + g.tasks.filter(t => t.completed).length, 0);
  const overallPct     = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Goals with individual progress
  const goalStats = displayGoals.map(g => ({
    ...g,
    done:  g.tasks.filter(t => t.completed).length,
    total: g.tasks.length,
    pct:   g.tasks.length > 0 ? Math.round((g.tasks.filter(t => t.completed).length / g.tasks.length) * 100) : 0,
  }));

  // Ring circle math
  const RADIUS = 44;
  const CIRC   = 2 * Math.PI * RADIUS;
  const offset = CIRC * (1 - overallPct / 100);

  // Simple 7-day simulated activity (last item = today)
  const weekData = [30, 45, 20, 60, 75, 50, overallPct].map(v => Math.min(v, 100));
  const maxVal   = Math.max(...weekData, 1);
  const chartH   = 70;
  const chartW   = (width * 0.85) - 40; // width of card minus padding
  const points   = weekData.map((v, i) => {
    const x = (i / (weekData.length - 1)) * chartW;
    const y = chartH - (v / maxVal) * chartH;
    return { x, y };
  });
  const pathD = points.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ');

  const pathD2 = points.map((p, i) =>
    i === 0 ? `M ${p.x + 0.8} ${p.y - 0.6}` : `L ${p.x + 0.8} ${p.y - 0.6}`
  ).join(' ');

  const days = isRTL
    ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    : ['Sat',  'Sun',   'Mon',     'Tue',       'Wed',       'Thu',    'Fri'];

  const today = new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >

        <View style={styles.safeTop} />

        {/* ── Top bar ── */}
        <Animated.View
          style={[
            styles.topBar,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.greetBlock}>
            <Text style={styles.greetDate}>{today}</Text>
            <Text style={styles.headerTitle}>
              {isRTL ? 'تقدمي' : 'My Progress'}
            </Text>
          </View>
          <HighlighterBadge
            text={`${totalGoals} ${isRTL ? 'هدف نشط' : 'Active Goals'}`}
            textColor={colors.textPrimary}
            highlightColor={colors.accent + '20'}
          />
        </Animated.View>

        {/* ── Stat row ── */}
        <View style={styles.statRow}>
          <ProgressStatCard
            rotate="-1.5deg"
            icon={<TargetIcon size={20} color={colors.accent} />}
            value={totalGoals}
            label={isRTL ? 'أهداف' : 'Goals'}
            styles={styles}
          />

          <ProgressStatCard
            rotate="1.2deg"
            icon={<CheckIcon size={20} color={colors.accentAlt} />}
            value={completedTasks}
            valueColor={colors.accentAlt}
            label={isRTL ? 'مهام منجزة' : 'Tasks Done'}
            styles={styles}
          />

          <ProgressStatCard
            rotate="-0.8deg"
            icon={<ZapIcon size={20} color={colors.accent} />}
            value={`${overallPct}%`}
            valueColor={colors.accent}
            label={isRTL ? 'إجمالي' : 'Overall'}
            styles={styles}
          />
        </View>

        {/* ── Charts (Horizontal Swipe) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartsScroll}
          contentContainerStyle={styles.chartsContent}
          decelerationRate="fast"
          snapToInterval={(width * 0.85) + 16}
        >
          {/* Card 1: Ring chart */}
          <ProgressChartCard styles={styles} width={width * 0.85}>
            <View style={styles.cardHeader}>
              <HighlighterBadge
                text={`${overallPct}%`}
                textColor={colors.accentAlt}
                highlightColor={colors.accentAlt + '20'}
              />
              <Text style={styles.cardTitle}>
                {isRTL ? 'إجمالي إتمام المهام' : 'Overall Completion'}
              </Text>
            </View>

            <View style={styles.ringWrapper}>
              <Svg width={150} height={150} viewBox="0 0 110 110">
                {/* Hand-drawn sketched base rings */}
                <Circle
                  cx="55" cy="55" r={RADIUS}
                  stroke={colors.border}
                  strokeWidth="1.5"
                  fill="transparent"
                  opacity={0.3}
                />
                <Circle
                  cx="55.5" cy="54.5" r={RADIUS - 1}
                  stroke={colors.border}
                  strokeWidth="1"
                  fill="transparent"
                  opacity={0.2}
                />
                <Circle
                  cx="54.5" cy="55.5" r={RADIUS + 1}
                  stroke={colors.border}
                  strokeWidth="1"
                  fill="transparent"
                  opacity={0.2}
                />

                {/* Progress colored arc */}
                <Circle
                  cx="55" cy="55" r={RADIUS}
                  stroke={colors.accentAlt}
                  strokeWidth="9"
                  fill="transparent"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={`${offset}`}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                />

                {/* Hand-drawn outlines bordering progress colored arc */}
                <Circle
                  cx="55" cy="55" r={RADIUS - 4.5}
                  stroke={colors.border}
                  strokeWidth="1.2"
                  fill="transparent"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={`${offset}`}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  opacity={0.7}
                />
                <Circle
                  cx="55" cy="55" r={RADIUS + 4.5}
                  stroke={colors.border}
                  strokeWidth="1.2"
                  fill="transparent"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={`${offset}`}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                  opacity={0.7}
                />
              </Svg>
              <View style={styles.ringTextCenter}>
                <Text style={styles.ringPct}>{overallPct}%</Text>
                <Text style={styles.ringLabel}>{isRTL ? 'مكتمل' : 'done'}</Text>
              </View>
            </View>

            <View style={styles.ringLegendRow}>
              <View style={styles.ringLegendItem}>
                <View style={[styles.ringLegendDot, { backgroundColor: colors.accentAlt }]} />
                <Text style={styles.ringLegendText}>
                  {completedTasks} {isRTL ? 'مكتملة' : 'completed'}
                </Text>
              </View>
              <View style={styles.ringLegendItem}>
                <View style={[styles.ringLegendDot, { backgroundColor: colors.borderLight }]} />
                <Text style={styles.ringLegendText}>
                  {totalTasks - completedTasks} {isRTL ? 'متبقية' : 'remaining'}
                </Text>
              </View>
            </View>
          </ProgressChartCard>

          {/* Card 2: Weekly trend */}
          <ProgressChartCard styles={styles} width={width * 0.85}>
            <View style={styles.cardHeader}>
              <TrendingUpIcon size={16} color={colors.accent} />
              <Text style={styles.cardTitle}>
                {isRTL ? 'نشاط الأسبوع' : 'Weekly Activity'}
              </Text>
            </View>

            <Svg width={chartW} height={chartH + 10} viewBox={`0 0 ${chartW} ${chartH + 10}`}>
              {/* Sketched dashed grid lines */}
              {[0, 0.33, 0.66, 1].map((frac, i) => (
                <Line
                  key={i}
                  x1="0" y1={frac * chartH}
                  x2={chartW} y2={frac * chartH}
                  stroke={colors.borderLight}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Main accent path */}
              <Path
                d={pathD}
                fill="none"
                stroke={colors.accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Sketched double offset line shadow */}
              <Path
                d={pathD2}
                fill="none"
                stroke={colors.border}
                strokeWidth="1.2"
                opacity={0.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Sketched cross indicators for points */}
              {points.map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x} cy={p.y}
                  r="4.5"
                  fill={i === points.length - 1 ? colors.accentAlt : colors.surfaceElevated}
                  stroke={colors.border}
                  strokeWidth="1.5"
                />
              ))}
            </Svg>

            <View style={styles.lineLabelsRow}>
              {days.map((d, i) => (
                <Text
                  key={i}
                  style={[styles.lineLabel, i === days.length - 1 && { color: colors.accentAlt, fontFamily: 'Cairo_700Bold' }]}
                >
                  {d}
                </Text>
              ))}
            </View>
          </ProgressChartCard>
        </ScrollView>

        {/* ── Goals breakdown (Now part of main scroll) ── */}
        <Animated.View
          style={[
            styles.goalsSection,
            { minHeight: 300, opacity: sectionFade, transform: [{ translateY: sectionAnim }] },
          ]}
        >
          <View style={styles.goalsHeader}>
            <Text style={styles.goalsHeaderTitle}>
              {isRTL ? 'تفاصيل الأهداف' : 'Goals Breakdown'}
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 }}>
            {goalStats.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🌱</Text>
                <Text style={styles.emptyTitle}>
                  {isRTL ? 'لا توجد أهداف بعد' : 'No goals yet'}
                </Text>
                <Text style={styles.emptyText}>
                  {isRTL
                    ? 'تحدث مع المرشد الذكي لإضافة أول هدف لك'
                    : 'Chat with the AI guide to add your first goal'}
                </Text>
              </View>
            ) : (
              goalStats.map((g, i) => (
                <GoalProgressRow
                  key={g.id}
                  goal={g}
                  isLast={i === goalStats.length - 1}
                  styles={styles}
                  active={active}
                />
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

export const ProgressScreen = React.memo(ProgressScreenInner);
