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
  Bell, Plus, ArrowLeft, ArrowRight,
  MessageSquare, Zap, Target, TrendingUp, CheckCircle,
} from 'lucide-react-native';
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
        >
          <Bell size={18} color="#8779F5" />
        </TouchableOpacity>

        <View style={styles.greetBlock}>
          <Text style={styles.greetDate}>{dayStr}</Text>
          <Text style={styles.greetText}>{greeting}</Text>
        </View>

        <TouchableOpacity onPress={onOpenSettings} style={styles.avatarBtn}>
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
            <TouchableOpacity
              onPress={() => onNavigate('chat')}
              style={styles.emptyCtaBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>{t.home_cta_btn}</Text>
              <MessageSquare size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

        ) : (
          <>
            {/* ── Stats row ── */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderColor: '#00BFA644' }]}>
                <View style={[styles.statIconBox, { backgroundColor: '#00BFA618' }]}>
                  <CheckCircle size={15} color="#00BFA6" />
                </View>
                <Text style={[styles.statValue, { color: '#00BFA6' }]}>{completedCount}</Text>
                <Text style={styles.statLabel}>{t.home_stat_tasks}</Text>
              </View>

              <View style={[styles.statCard, { borderColor: '#8779F544' }]}>
                <View style={[styles.statIconBox, { backgroundColor: '#8779F518' }]}>
                  <TrendingUp size={15} color="#8779F5" />
                </View>
                <Text style={[styles.statValue, { color: '#8779F5' }]}>{progressPercent}%</Text>
                <Text style={styles.statLabel}>{isRTL ? 'التقدم' : 'Progress'}</Text>
              </View>

              <View style={[styles.statCard, { borderColor: '#6C5CE744' }]}>
                <View style={[styles.statIconBox, { backgroundColor: '#6C5CE718' }]}>
                  <Target size={15} color="#6C5CE7" />
                </View>
                <Text style={[styles.statValue, { color: '#6C5CE7' }]}>{totalCount}</Text>
                <Text style={styles.statLabel}>{isRTL ? 'مهمة' : 'Total'}</Text>
              </View>
            </View>

            {/* ── Hero goal card (flex: 1 → takes remaining space) ── */}
            <View style={styles.heroCard}>
              {/* Top accent bar */}
              <View style={styles.heroGlowBar} />

              {/* Badge */}
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Zap size={10} color="#8779F5" />
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
                <TouchableOpacity
                  onPress={() => onNavigate('vision')}
                  style={styles.heroBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroBtnText}>{t.home_view_tasks}</Text>
                  {isRTL
                    ? <ArrowLeft  size={13} color="#FFFFFF" />
                    : <ArrowRight size={13} color="#FFFFFF" />}
                </TouchableOpacity>
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
                  {isRTL ? 'حدد هدفاً جديداً →' : 'Set a new one →'}
                </Text>
              </View>
              <View style={styles.newGoalArrow}>
                <Plus size={18} color="#FFFFFF" />
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
      marginBottom: 16,
    },
    iconBtn: {
      width: 42, height: 42, borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    greetBlock: { alignItems: 'center', flex: 1 },
    greetDate:  { fontSize: 10, fontFamily: 'Cairo_400Regular', color: colors.textMuted, letterSpacing: 0.4 },
    greetText:  { fontSize: 16, fontFamily: 'Cairo_700Bold', color: colors.textPrimary },
    avatarBtn: {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: colors.accent,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45, shadowRadius: 8, elevation: 4,
    },
    avatarLetter:    { fontSize: 17, fontFamily: 'Cairo_700Bold', color: '#FFFFFF' },
    avatarOnlineDot: {
      position: 'absolute', bottom: 1, right: 1,
      width: 9, height: 9, borderRadius: 5,
      backgroundColor: colors.accentAlt,
      borderWidth: 1.5, borderColor: colors.bg,
    },

    /* ── Mascot banner ── */
    mascotRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 20, marginBottom: 18,
    },
    mascotOrb: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.accent,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.accentAlt,
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4, shadowRadius: 6, elevation: 3, flexShrink: 0,
    },
    mascotFace: {
      width: 24, height: 16, borderRadius: 7,
      backgroundColor: colors.bg,
      justifyContent: 'center', alignItems: 'center',
    },
    mascotEyes: {
      width: 12, height: 4, borderRadius: 2,
      borderWidth: 2, borderColor: colors.accentAlt,
      borderBottomWidth: 0, transform: [{ scaleY: -1 }],
    },
    mascotBase: { width: 26, height: 4, borderRadius: 2, backgroundColor: colors.accentAlt, marginTop: 2 },
    speechBubble: {
      flex: 1, backgroundColor: colors.surface,
      borderRadius: 16, borderTopLeftRadius: 4,
      paddingVertical: 10, paddingHorizontal: 14,
      borderWidth: 1, borderColor: colors.borderLight,
    },
    speechText: {
      fontSize: 12, fontFamily: 'Cairo_600SemiBold',
      color: colors.accent, lineHeight: 20, textAlign: 'right',
    },

    /* ── Main flex area ── */
    main: {
      flex: 1,
      paddingHorizontal: 20,
    },

    /* ── Empty state ── */
    emptyCard: {
      flex: 1, backgroundColor: colors.surface, borderRadius: 28,
      padding: 32, alignItems: 'center', justifyContent: 'center', gap: 16,
      borderWidth: 1, borderColor: colors.borderLight,
    },
    largeMascotWrap:  { alignItems: 'center', gap: 4 },
    largeMascotFace: {
      width: 70, height: 50, borderRadius: 25,
      backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    },
    largeMascotEyes: {
      width: 36, height: 12, borderRadius: 6,
      borderWidth: 3, borderColor: '#FFFFFF',
      borderBottomWidth: 0, transform: [{ scaleY: -1 }],
    },
    largeMascotBase: { width: 60, height: 14, borderRadius: 7, backgroundColor: colors.accentAlt },
    emptyTitle:  { fontSize: 18, fontFamily: 'Cairo_700Bold', color: colors.textPrimary, textAlign: 'center' },
    emptyHint:   { fontSize: 13, fontFamily: 'Cairo_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
    emptyCtaBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.accent, borderRadius: 16,
      paddingVertical: 14, paddingHorizontal: 28,
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
    },
    emptyCtaText: { fontSize: 15, fontFamily: 'Cairo_700Bold', color: '#FFFFFF' },

    /* ── Stats ── */
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statCard: {
      flex: 1, backgroundColor: colors.surface, borderRadius: 18,
      padding: 14, alignItems: 'center', gap: 5, borderWidth: 1, borderColor: colors.borderLight,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    },
    statIconBox: {
      width: 32, height: 32, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', marginBottom: 2,
    },
    statValue: { fontSize: 18, fontFamily: 'Cairo_700Bold' },
    statLabel: { fontSize: 9, fontFamily: 'Cairo_400Regular', color: colors.textMuted, letterSpacing: 0.4, textAlign: 'center' },

    /* ── Hero card ── */
    heroCard: {
      flex: 1,                       // takes all remaining vertical space
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 22,
      marginBottom: 14,
      borderWidth: 1, borderColor: colors.accent + '40',
      overflow: 'hidden',
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
    },
    heroGlowBar: {
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 3, backgroundColor: colors.accent, opacity: 0.9,
    },
    heroBadgeRow: { alignItems: 'flex-end', marginBottom: 12 },
    heroBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: colors.accent + '20', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 3,
      borderWidth: 1, borderColor: colors.accent + '40',
    },
    heroBadgeText: { fontSize: 10, fontFamily: 'Cairo_700Bold', color: colors.accent, letterSpacing: 0.5 },
    heroGoalText: {
      fontSize: 18, fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary, lineHeight: 30,
    },
    heroProgressRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18,
    },
    heroProgressTrack: {
      flex: 1, height: 7, backgroundColor: colors.bgSecondary, borderRadius: 4, overflow: 'hidden',
    },
    heroProgressFill: {
      height: '100%', backgroundColor: colors.accent, borderRadius: 4,
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7, shadowRadius: 4,
    },
    heroProgressPct: {
      fontSize: 13, fontFamily: 'Cairo_700Bold', color: colors.accent, minWidth: 38, textAlign: 'right',
    },
    heroFooter: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    heroTaskCount: { fontSize: 12, fontFamily: 'Cairo_400Regular', color: colors.textMuted },
    heroBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 9,
      borderRadius: 12,
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4, shadowRadius: 6, elevation: 3,
    },
    heroBtnText: { fontSize: 12, fontFamily: 'Cairo_700Bold', color: '#FFFFFF' },

    /* ── New goal CTA ── */
    newGoalCard: {
      borderRadius: 18, borderWidth: 1.5,
      borderStyle: 'dashed', borderColor: colors.accent + '55',
      backgroundColor: colors.accent + '0A',
      paddingVertical: 14, paddingHorizontal: 18,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    newGoalTitle: { fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary, marginBottom: 2 },
    newGoalHint:  { fontSize: 12, fontFamily: 'Cairo_600SemiBold', color: colors.accent },
    newGoalArrow: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4, shadowRadius: 6, elevation: 3,
    },
  });
}
