import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Bell, ChevronLeft, Plus, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react-native';
import { ActiveTab, Goal, Task } from '../types';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  onNavigate:     (s: ActiveTab) => void;
  activeGoal:     Goal | null;
  tasks:          Task[];
  onLogout:       () => void;
  onOpenSettings: () => void;
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    scrollContainer: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'android' ? 16 : 10,
      paddingBottom: 82,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    bellBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    userTextContainer: { alignItems: 'flex-end' },
    dateLabel: {
      fontSize: 11,
      fontFamily: 'Cairo_400Regular',
      color: colors.textMuted,
    },
    greetingLabel: {
      fontSize: 18,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    avatarCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarLetter: { fontSize: 18, color: '#FFF', fontFamily: 'Cairo_700Bold' },

    // Mascot banner
    mascotBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    speechBubble: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    speechText: {
      fontSize: 12,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.accent,
      lineHeight: 20,
      textAlign: 'right',
    },
    mascotCircleMini: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2.5,
      borderColor: colors.accentAlt,
    },
    mascotFaceMini: {
      width: 28,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mascotEyesMini: {
      width: 14,
      height: 5,
      borderRadius: 2.5,
      borderWidth: 2,
      borderColor: colors.accentAlt,
      borderBottomWidth: 0,
      transform: [{ scaleY: -1 }],
    },
    mascotBaseMini: {
      width: 30,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accentAlt,
      marginTop: 3,
    },

    // Stats row
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    statIcon: { fontSize: 18 },
    statValue: { fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary },
    statLabel: { fontSize: 10, fontFamily: 'Cairo_400Regular', color: colors.textMuted },

    // Hero card
    heroCard: {
      backgroundColor: colors.accent,
      borderRadius: 22,
      padding: 20,
      marginBottom: 20,
      position: 'relative',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 6,
    },
    heroPin: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#FFFFFF',
      position: 'absolute',
      top: -5,
      right: 24,
    },
    heroHeader: { flexDirection: 'row-reverse', marginBottom: 8 },
    heroBadgeText: {
      fontSize: 11,
      fontFamily: 'Cairo_700Bold',
      color: 'rgba(255,255,255,0.8)',
    },
    heroGoalText: {
      fontSize: 17,
      fontFamily: 'Cairo_700Bold',
      color: '#FFFFFF',
      lineHeight: 28,
      textAlign: 'right',
      marginBottom: 14,
    },
    heroDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginBottom: 12,
    },
    heroFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    heroTasksCount: {
      fontSize: 12,
      fontFamily: 'Cairo_600SemiBold',
      color: 'rgba(255,255,255,0.75)',
    },
    heroActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      gap: 4,
    },
    heroActionBtnText: {
      fontSize: 12,
      fontFamily: 'Cairo_700Bold',
      color: colors.accent,
    },

    // Section headers
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
    },
    sectionLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    sectionLinkText: {
      fontSize: 13,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.accent,
    },
    addGoalBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.accent + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Goal card
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    goalInfo: { flex: 1 },
    goalTitleRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    activePill: {
      backgroundColor: colors.accentAlt + '22',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    activePillText: {
      fontSize: 10,
      fontFamily: 'Cairo_700Bold',
      color: colors.accentAlt,
    },
    goalCardTitle: {
      fontSize: 14,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
      flex: 1,
      textAlign: 'right',
    },
    goalProgressRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
    },
    goalProgressPercent: {
      fontSize: 12,
      fontFamily: 'Cairo_700Bold',
      color: colors.accent,
    },
    progressBarWrapper: {
      flex: 1,
      height: 6,
      backgroundColor: colors.bg,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarInner: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 3,
    },
    goalTasksText: {
      fontSize: 11,
      fontFamily: 'Cairo_400Regular',
      color: colors.textMuted,
    },
    goalIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalIcon: { fontSize: 22 },

    // Chips
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },
    chipBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: { fontSize: 13, fontFamily: 'Cairo_600SemiBold', color: colors.textSecondary },
    chipEmoji: { fontSize: 14 },

    // Onboarding CTA
    onboardingCtaCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      gap: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    largeMascotContainer: { alignItems: 'center' },
    largeMascot: { alignItems: 'center', gap: 4 },
    mascotFaceLarge: {
      width: 70,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mascotEyesLarge: {
      width: 36,
      height: 12,
      borderRadius: 6,
      borderWidth: 3,
      borderColor: '#FFF',
      borderBottomWidth: 0,
      transform: [{ scaleY: -1 }],
    },
    mascotBaseLarge: {
      width: 60,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.accentAlt,
    },
    speechBubbleLarge: {
      backgroundColor: colors.bg,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    speechTextLarge: {
      fontSize: 14,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textSecondary,
      lineHeight: 24,
      textAlign: 'center',
    },
    ctaPrimaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'stretch',
      justifyContent: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
    },
    ctaPrimaryBtnText: {
      fontSize: 15,
      fontFamily: 'Cairo_700Bold',
      color: '#FFFFFF',
    },
    // New goal CTA card
    newGoalCta: {
      width: '100%',
      borderRadius: 18,
      borderWidth: 2,
      borderStyle: 'dashed' as const,
      borderColor: colors.accent + '55',
      backgroundColor: colors.accent + '0A',
      paddingVertical: 18,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    newGoalCtaTitle: {
      fontSize: 15,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    newGoalCtaHint: {
      fontSize: 12,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.accent,
    },
    newGoalCtaArrow: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function HomeScreen({ onNavigate, activeGoal, tasks, onLogout, onOpenSettings }: Props) {
  const { colors, t, language } = useAppSettings();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const completedCount  = tasks.filter((t) => t.completed).length;
  const totalCount      = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isRTL           = language === 'ar';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Profile Row */}
        <View style={styles.profileRow}>
          {/* Left: spacer to keep profile row balanced */}
          <View style={{ width: 44 }} />

          {/* Right: Greeting + Avatar (avatar tap → settings) */}
          <View style={styles.profileInfo}>
            <View style={styles.userTextContainer}>
              <Text style={styles.dateLabel}>{t.home_today}</Text>
              <Text style={styles.greetingLabel}>{t.home_greeting}</Text>
            </View>
            <TouchableOpacity onPress={onOpenSettings} style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{language === 'ar' ? 'م' : 'U'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!activeGoal ? (
          /* ── Empty / First-time user ── */
          <View style={styles.onboardingCtaCard}>
            <View style={styles.largeMascotContainer}>
              <View style={styles.largeMascot}>
                <View style={styles.mascotFaceLarge}>
                  <View style={styles.mascotEyesLarge} />
                </View>
                <View style={styles.mascotBaseLarge} />
              </View>
            </View>

            <View style={styles.speechBubbleLarge}>
              <Text style={styles.speechTextLarge}>{t.home_welcome_msg}</Text>
            </View>

            <TouchableOpacity onPress={() => onNavigate('chat')} style={styles.ctaPrimaryBtn}>
              <Text style={styles.ctaPrimaryBtnText}>{t.home_cta_btn}</Text>
              <MessageSquare size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Active user dashboard ── */
          <>
            {/* Mascot Banner */}
            <View style={styles.mascotBanner}>
              <View style={styles.speechBubble}>
                <Text style={styles.speechText}>{t.home_mascot_msg}</Text>
              </View>
              <View style={styles.mascotCircleMini}>
                <View style={styles.mascotFaceMini}>
                  <View style={styles.mascotEyesMini} />
                </View>
                <View style={styles.mascotBaseMini} />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>✅</Text>
                <Text style={styles.statValue}>{completedCount}</Text>
                <Text style={styles.statLabel}>{t.home_stat_tasks}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={styles.statValue}>{progressPercent}%</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'التقدم' : 'Progress'}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statValue}>{totalCount}</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'مهمة' : 'Total Tasks'}</Text>
              </View>
            </View>

            {/* Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroPin} />
              <View style={styles.heroHeader}>
                <Text style={styles.heroBadgeText}>{t.home_goal_active}</Text>
              </View>
              <Text style={[styles.heroGoalText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {activeGoal.text}
              </Text>
              <View style={styles.heroDivider} />
              <View style={styles.heroFooter}>
                <Text style={styles.heroTasksCount}>
                  {completedCount} {t.home_tasks_done.replace('{t}', String(totalCount))}
                </Text>
                <TouchableOpacity onPress={() => onNavigate('vision')} style={styles.heroActionBtn}>
                  <Text style={styles.heroActionBtnText}>{t.home_view_tasks}</Text>
                  {isRTL
                    ? <ArrowLeft  size={14} color={colors.accent} />
                    : <ArrowRight size={14} color={colors.accent} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Active Goals Section */}
            <View style={styles.sectionHeader}>
              <TouchableOpacity onPress={() => onNavigate('vision')} style={styles.sectionLink}>
                <Text style={styles.sectionLinkText}>{t.home_goal_details}</Text>
                <ChevronLeft size={16} color={colors.accent} />
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>{t.home_my_goals}</Text>
            </View>

            <TouchableOpacity onPress={() => onNavigate('vision')} style={styles.goalCard}>
              <ChevronLeft size={20} color={colors.textMuted} />
              <View style={styles.goalInfo}>
                <View style={styles.goalTitleRow}>
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>{t.home_active_pill}</Text>
                  </View>
                  <Text style={styles.goalCardTitle} numberOfLines={1}>{activeGoal.text}</Text>
                </View>
                <View style={styles.goalProgressRow}>
                  <Text style={styles.goalProgressPercent}>{progressPercent}%</Text>
                  <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBarInner, { width: `${progressPercent}%` as any }]} />
                  </View>
                  <Text style={styles.goalTasksText}>{completedCount}/{totalCount} {t.tasks}</Text>
                </View>
              </View>
              <View style={styles.goalIconContainer}>
                <Text style={styles.goalIcon}>🎯</Text>
              </View>
            </TouchableOpacity>

            {/* New Goal CTA card */}
            <TouchableOpacity
              onPress={() => onNavigate('chat')}
              style={styles.newGoalCta}
              activeOpacity={0.8}
            >
              <View>
                <Text style={[styles.newGoalCtaTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {t.home_new_goal}
                </Text>
                <Text style={[styles.newGoalCtaHint, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {language === 'ar' ? 'حدد هدفاً! →' : 'Set one! →'}
                </Text>
              </View>
              <View style={styles.newGoalCtaArrow}>
                <Plus size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
