import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Path, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TrendingUp, Target, CheckCircle, Zap } from 'lucide-react-native';
import { GoalPin, Task } from '../types';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 12) / 2;

interface Props {
  goals: GoalPin[];
  tasks: Task[];
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.bg },
    header: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'android' ? 16 : 10,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.bg,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: 11,
      fontFamily: 'Cairo_400Regular',
      color: colors.textMuted,
    },
    headerTitle: {
      fontSize: 22,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    headerBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.accentAlt + '20',
    },
    headerBadgeText: {
      fontSize: 11,
      fontFamily: 'Cairo_700Bold',
      color: colors.accentAlt,
    },
    scroll: { flex: 1 },
    scrollContent: {
      padding: 20,
      paddingBottom: 90,
      gap: 16,
    },

    // ── Stat row ──
    statRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    statValue: {
      fontSize: 22,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: 10,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textMuted,
      textAlign: 'center',
    },

    // ── Metric cards ──
    card: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
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

    // Ring chart
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

    // Line chart
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

    // Goals list
    goalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      gap: 12,
    },
    goalRowLast: {
      borderBottomWidth: 0,
    },
    goalEmoji: { fontSize: 22, width: 28, textAlign: 'center' },
    goalInfo:  { flex: 1, gap: 6 },
    goalName: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    goalBarTrack: {
      height: 5,
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
  const chartW   = width - 80;
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

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.headerBadge]}>
            <Text style={styles.headerBadgeText}>
              {totalGoals} {isRTL ? 'هدف نشط' : 'Active Goals'}
            </Text>
          </View>
          <Text style={styles.headerTitle}>
            {isRTL ? 'تقدمي' : 'My Progress'}
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {today}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Stat row ── */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.accent + '18' }]}>
              <Target size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{totalGoals}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'أهداف' : 'Goals'}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.accentAlt + '18' }]}>
              <CheckCircle size={20} color={colors.accentAlt} />
            </View>
            <Text style={[styles.statValue, { color: colors.accentAlt }]}>{completedTasks}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'مهام منجزة' : 'Tasks Done'}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#F59E0B18' }]}>
              <Zap size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{overallPct}%</Text>
            <Text style={styles.statLabel}>{isRTL ? 'إجمالي' : 'Overall'}</Text>
          </View>
        </View>

        {/* ── Ring chart ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardBadge]}>
              <Text style={styles.cardBadgeText}>{overallPct}%</Text>
            </View>
            <Text style={styles.cardTitle}>
              {isRTL ? 'إجمالي إتمام المهام' : 'Overall Task Completion'}
            </Text>
          </View>

          <View style={styles.ringWrapper}>
            <Svg width={150} height={150} viewBox="0 0 110 110">
              {/* Track */}
              <Circle
                cx="55" cy="55" r={RADIUS}
                stroke={colors.borderLight}
                strokeWidth="10"
                fill="transparent"
              />
              {/* Fill */}
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

        {/* ── Weekly trend ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={16} color={colors.accent} />
            <Text style={styles.cardTitle}>
              {isRTL ? 'نشاط الأسبوع' : 'Weekly Activity'}
            </Text>
          </View>

          <Svg width={chartW} height={chartH + 10} viewBox={`0 0 ${chartW} ${chartH + 10}`}>
            {/* Grid lines */}
            {[0, 0.33, 0.66, 1].map((frac, i) => (
              <Line
                key={i}
                x1="0" y1={frac * chartH}
                x2={chartW} y2={frac * chartH}
                stroke={colors.borderLight}
                strokeWidth="1"
              />
            ))}
            {/* Area fill — thin accent line */}
            <Path
              d={pathD}
              fill="none"
              stroke={colors.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Node dots */}
            {points.map((p, i) => (
              <Circle
                key={i}
                cx={p.x} cy={p.y}
                r="4"
                fill={i === points.length - 1 ? colors.accentAlt : colors.surface}
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

        {/* ── Goals breakdown ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardBadge]}>
              <Text style={styles.cardBadgeText}>{totalGoals}</Text>
            </View>
            <Text style={styles.cardTitle}>
              {isRTL ? 'تقدم الأهداف' : 'Goals Progress'}
            </Text>
          </View>

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
        </View>

      </ScrollView>
    </View>
  );
}
