import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { TrendingUp, Target, CheckCircle, Zap } from 'lucide-react-native';
import { GoalPin, Task } from '../types';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  goals: GoalPin[];
  tasks: Task[];
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    safeTop: { height: Platform.OS === 'ios' ? 54 : 30 },
    
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
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderLight,
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
      backgroundColor: colors.surfaceElevated,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
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
      fontFamily: 'Cairo_600SemiBold',
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
      backgroundColor: colors.surfaceElevated,
      borderRadius: 22,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
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
      backgroundColor: colors.accent + '15',
    },
    cardBadgeText: {
      fontSize: 10,
      fontFamily: 'Cairo_700Bold',
      color: colors.accent,
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
      flex: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 5,
    },
    goalsHeader: {
      paddingHorizontal: 24,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
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
      borderBottomWidth: 1,
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
      height: 6,
      backgroundColor: colors.bg,
      borderRadius: 3,
      overflow: 'hidden',
    },
    goalBarFill: {
      height: '100%',
      borderRadius: 3,
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

export function ProgressScreen({ goals, tasks }: Props) {
  const { colors, t, language } = useAppSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isRTL = language === 'ar';

  // ── Real computed stats ──
  const totalGoals     = goals.length;
  const totalTasks     = goals.reduce((sum, g) => sum + g.tasks.length, 0);
  const completedTasks = goals.reduce((sum, g) => sum + g.tasks.filter(t => t.completed).length, 0);
  const overallPct     = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Goals with individual progress
  const goalStats = goals.map(g => ({
    ...g,
    done:  g.tasks.filter(t => t.completed).length,
    total: g.tasks.length,
    pct:   g.tasks.length > 0 ? Math.round((g.tasks.filter(t => t.completed).length / g.tasks.length) * 100) : 0,
  }));

  // Ring circle math
  const RADIUS = 46;
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

  const days = isRTL
    ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    : ['Sat',  'Sun',   'Mon',     'Tue',       'Wed',       'Thu',    'Fri'];

  const today = new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* ── Background glow blobs ── */}
      <View style={styles.bgPurple} />
      <View style={styles.bgTeal} />

      <View style={styles.safeTop} />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <View style={styles.greetBlock}>
          <Text style={styles.greetDate}>{today}</Text>
          <Text style={styles.headerTitle}>
            {isRTL ? 'تقدمي' : 'My Progress'}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {totalGoals} {isRTL ? 'هدف نشط' : 'Active Goals'}
          </Text>
        </View>
      </View>

      {/* ── Stat row ── */}
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Target size={20} color={colors.accent} />
          <Text style={styles.statValue}>{totalGoals}</Text>
          <Text style={styles.statLabel}>{isRTL ? 'أهداف' : 'Goals'}</Text>
        </View>

        <View style={styles.statCard}>
          <CheckCircle size={20} color={colors.accentAlt} />
          <Text style={[styles.statValue, { color: colors.accentAlt }]}>{completedTasks}</Text>
          <Text style={styles.statLabel}>{isRTL ? 'مهام منجزة' : 'Tasks Done'}</Text>
        </View>

        <View style={styles.statCard}>
          <Zap size={20} color="#F59E0B" />
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{overallPct}%</Text>
          <Text style={styles.statLabel}>{isRTL ? 'إجمالي' : 'Overall'}</Text>
        </View>
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
        <View style={[styles.card, { width: width * 0.85 }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardBadge]}>
              <Text style={styles.cardBadgeText}>{overallPct}%</Text>
            </View>
            <Text style={styles.cardTitle}>
              {isRTL ? 'إجمالي إتمام المهام' : 'Overall Completion'}
            </Text>
          </View>

          <View style={styles.ringWrapper}>
            <Svg width={150} height={150} viewBox="0 0 110 110">
              <Circle
                cx="55" cy="55" r={RADIUS}
                stroke={colors.border}
                strokeWidth="10"
                fill="transparent"
              />
              <Circle
                cx="55" cy="55" r={RADIUS}
                stroke={colors.accentAlt}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${CIRC}`}
                strokeDashoffset={`${offset}`}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
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
        </View>

        {/* Card 2: Weekly trend */}
        <View style={[styles.card, { width: width * 0.85 }]}>
          <View style={styles.cardHeader}>
            <TrendingUp size={16} color={colors.accent} />
            <Text style={styles.cardTitle}>
              {isRTL ? 'نشاط الأسبوع' : 'Weekly Activity'}
            </Text>
          </View>

          <Svg width={chartW} height={chartH + 10} viewBox={`0 0 ${chartW} ${chartH + 10}`}>
            {[0, 0.33, 0.66, 1].map((frac, i) => (
              <Line
                key={i}
                x1="0" y1={frac * chartH}
                x2={chartW} y2={frac * chartH}
                stroke={colors.borderLight}
                strokeWidth="1"
              />
            ))}
            <Path
              d={pathD}
              fill="none"
              stroke={colors.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p, i) => (
              <Circle
                key={i}
                cx={p.x} cy={p.y}
                r="4"
                fill={i === points.length - 1 ? colors.accentAlt : colors.surfaceElevated}
                stroke={i === points.length - 1 ? colors.accentAlt : colors.accent}
                strokeWidth="2"
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
        </View>
      </ScrollView>

      {/* ── Goals breakdown (Constrained ScrollView) ── */}
      <View style={styles.goalsSection}>
        <View style={styles.goalsHeader}>
          <Text style={styles.goalsHeaderTitle}>
            {isRTL ? 'تفاصيل الأهداف' : 'Goals Breakdown'}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        >
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
              <View
                key={g.id}
                style={[styles.goalRow, i === goalStats.length - 1 && styles.goalRowLast]}
              >
                <Text style={styles.goalEmoji}>{g.emoji}</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName} numberOfLines={1}>{g.text}</Text>
                  <View style={styles.goalBarTrack}>
                    <View style={[styles.goalBarFill, { width: `${g.pct}%` as any, backgroundColor: g.pinColor }]} />
                  </View>
                </View>
                <Text style={styles.goalPct}>{g.pct}%</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
