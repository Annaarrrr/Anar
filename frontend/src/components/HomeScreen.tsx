import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
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
import { NotebookBackground } from './common/NotebookBackground';
import { WashiTape, Pushpin } from './common/PinOrnaments';
import { ActiveTab, Goal, Task } from '../types';
import { useAppSettings } from '../context/AppContext';
import { Mascot } from './Mascot';

interface Props {
  onNavigate:     (s: ActiveTab) => void;
  activeGoal:     Goal | null;
  tasks:          Task[];
  onLogout:       () => void;
  onOpenSettings: () => void;
}

export function HomeScreen({ onNavigate, activeGoal, tasks, onLogout, onOpenSettings }: Props) {
  const { colors, t, language } = useAppSettings();
  const isRTL = language === 'ar';
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const completedCount  = tasks.filter((tk) => tk.completed).length;
  const totalCount      = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? (isRTL ? '☀️ صباح الخير' : '☀️ Good Morning') :
    hour < 18 ? (isRTL ? '🌤 مساء الخير'  : '🌤 Good Afternoon') :
                (isRTL ? '🌙 مساء النور'  : '🌙 Good Evening');

  const dayStr = new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Notebook Background */}
      <NotebookBackground />

      {/* ── Background glow blobs ── */}
      <View style={styles.bgPurple} />
      <View style={styles.bgTeal} />

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
          <Text style={styles.greetDate}>{dayStr}</Text>
          <Text style={styles.greetText}>{greeting}</Text>
        </View>

        <TouchableOpacity onPress={onOpenSettings} style={styles.avatarBtn} activeOpacity={0.7}>
          <Text style={styles.avatarLetter}>{isRTL ? 'م' : 'U'}</Text>
          <View style={styles.avatarOnlineDot} />
        </TouchableOpacity>
      </View>

      {/* ── Mascot hint banner ── */}
      <View style={styles.mascotRow}>
        <Mascot size={46} />
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{t.home_mascot_msg}</Text>
        </View>
      </View>

      {/* ── Main content (fills remaining space) ── */}
      <View style={styles.main}>

        {!activeGoal ? (
          /* ── Empty state ── */
          <View style={styles.emptyCard}>
            <Mascot size={80} />
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
              <View style={[styles.statCard, { transform: [{ rotate: '-1.5deg' }] }]}>
                <WashiTape style={{ top: -8, backgroundColor: 'rgba(135, 121, 245, 0.25)' }} />
                <View style={[styles.statIconBox, { backgroundColor: colors.accentAlt + '20' }]}>
                  <CheckIcon size={16} color={colors.accentAlt} />
                </View>
                <Text style={[styles.statValue, { color: colors.accentAlt }]}>{completedCount}</Text>
                <Text style={styles.statLabel}>{t.home_stat_tasks}</Text>
              </View>

              <View style={[styles.statCard, { transform: [{ rotate: '1.2deg' }] }]}>
                <WashiTape style={{ top: -8 }} />
                <View style={[styles.statIconBox, { backgroundColor: colors.accent + '20' }]}>
                  <TrendingUpIcon size={16} color={colors.accent} />
                </View>
                <Text style={[styles.statValue, { color: colors.accent }]}>{progressPercent}%</Text>
                <Text style={styles.statLabel}>{isRTL ? 'التقدم' : 'Progress'}</Text>
              </View>

              <View style={[styles.statCard, { transform: [{ rotate: '-0.8deg' }] }]}>
                <WashiTape style={{ top: -8, backgroundColor: 'rgba(101, 83, 74, 0.25)' }} />
                <View style={[styles.statIconBox, { backgroundColor: colors.textSecondary + '20' }]}>
                  <TargetIcon size={16} color={colors.textSecondary} />
                </View>
                <Text style={[styles.statValue, { color: colors.textSecondary }]}>{totalCount}</Text>
                <Text style={styles.statLabel}>{isRTL ? 'مهمة' : 'Total'}</Text>
              </View>
            </View>

            {/* ── Hero goal card (flex: 1 → takes remaining space) ── */}
            <View style={styles.heroCard}>
              <Pushpin style={{ top: -14 }} />
              {/* Badge */}
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <ZapIcon size={10} color={colors.accent} />
                  <Text style={styles.heroBadgeText}>{t.home_goal_active}</Text>
                </View>
              </View>

              {/* Goal text */}
              <Text
                style={[styles.heroGoalText, { textAlign: isRTL ? 'right' : 'left' }]}
                numberOfLines={3}
              >
                {activeGoal.text}
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
            <TouchableOpacity
              onPress={() => onNavigate('chat')}
              style={styles.newGoalCard}
              activeOpacity={0.8}
            >
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
            </TouchableOpacity>
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
      backgroundColor: colors.bg,
    },
    safeTop:    { height: Platform.OS === 'ios' ? 54 : 20 },
    safeBottom: { height: 86 },  // clears the tab bar

    /* ── Background blobs ── */
    bgPurple: {
      position: 'absolute',
      top: -80, right: -60,
      width: 280, height: 280, borderRadius: 140,
      backgroundColor: colors.accent, opacity: 0.12,
    },
    bgTeal: {
      position: 'absolute',
      bottom: 160, left: -80,
      width: 240, height: 240, borderRadius: 120,
      backgroundColor: colors.accentAlt, opacity: 0.08,
    },

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
    greetBlock: { alignItems: 'center', flex: 1 },
    greetDate:  { fontSize: 10, fontFamily: 'Cairo_600SemiBold', color: colors.textMuted, letterSpacing: 0.4 },
    greetText:  { fontSize: 16, fontFamily: 'Cairo_700Bold', color: colors.textPrimary },
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
