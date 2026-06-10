import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { Share2, Plus, Check, X, MessageSquare, Pencil, Trash2 } from 'lucide-react-native';
import { ActiveTab, GoalPin } from '../types';
import { api } from '../services/api';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { Mascot } from './Mascot';

const { width } = Dimensions.get('window');
const CARD_W = (width - 40 - 12) / 2;

interface Props {
  onNavigate: (s: ActiveTab) => void;
  goals: GoalPin[];
  activeGoalId: string | null;
  onGoalPress: (goal: GoalPin) => void;
  onSetActiveGoal: (id: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

export function VisionBoardScreen({ onNavigate, goals, activeGoalId, onGoalPress, onSetActiveGoal, refreshGoals }: Props) {
  const { t, language, colors, theme } = useAppSettings();
  const isRTL = language === 'ar';
  const styles = useMemo(() => makeStyles(colors, theme), [colors, theme]);

  const [taskModalGoal, setTaskModalGoal] = useState<GoalPin | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editGoalText, setEditGoalText] = useState('');

  const handleEditSave = async () => {
    if (!taskModalGoal) return;
    if (!editGoalText.trim()) {
      Alert.alert(isRTL ? 'تنبيه' : 'Alert', isRTL ? 'يرجى إدخال اسم للهدف' : 'Please enter a goal name');
      return;
    }
    try {
      await api.updateGoal(taskModalGoal.id, editGoalText.trim());
      setIsEditing(false);
      await refreshGoals();
      // Reload taskModalGoal reference
      const fresh = await api.getGoals();
      const updated = fresh.find((g) => g.id === taskModalGoal.id) ?? null;
      setTaskModalGoal(updated);
    } catch {
      Alert.alert(t.error, isRTL ? 'فشل تحديث الهدف' : 'Failed to update goal');
    }
  };

  const handleDelete = () => {
    if (!taskModalGoal) return;
    Alert.alert(
      isRTL ? 'حذف الهدف' : 'Delete Goal',
      isRTL
        ? 'هل أنت متأكد من حذف هذا الهدف؟ سيتم حذف جميع المهام والتقدم المرتبط به.'
        : 'Are you sure you want to delete this goal? All associated tasks and progress will be permanently lost.',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteGoal(taskModalGoal.id);
              setTaskModalGoal(null);
              await refreshGoals();
            } catch {
              Alert.alert(t.error, isRTL ? 'فشل حذف الهدف' : 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  // The "focus" goal: user-chosen active or fallback to latest
  const focusGoal = goals.length > 0
    ? (activeGoalId ? (goals.find(g => g.id === activeGoalId) ?? goals[goals.length - 1]) : goals[goals.length - 1])
    : null;
  const focusTasks        = focusGoal?.tasks ?? [];
  const completedCount    = focusTasks.filter((t) => t.completed).length;
  const totalCount        = focusTasks.length;
  const progressPercent   = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const firstIncompleteTask = focusTasks.find((t) => !t.completed);

  const handleCompleteTask = async () => {
    if (!focusGoal || !firstIncompleteTask) {
      Alert.alert('🎉', t.vision_task_done);
      return;
    }
    try {
      await api.toggleTask(firstIncompleteTask.id, true);
      await refreshGoals();
    } catch {
      Alert.alert(t.error, isRTL ? 'فشل تحديث المهمة' : 'Failed to update task');
    }
  };

  const toggleModalTask = async (goalId: string, taskId: string, currentlyCompleted: boolean) => {
    try {
      await api.toggleTask(taskId, !currentlyCompleted);
      await refreshGoals();
      // Refresh modal goal reference
      const fresh = await api.getGoals();
      const updated = fresh.find((g) => g.id === goalId) ?? null;
      setTaskModalGoal(updated);
    } catch {
      Alert.alert(t.error, isRTL ? 'فشل تحديث المهمة' : 'Failed to update task');
    }
  };

  return (
    <View style={styles.container}>

      {/* ── Header (no redundant + button) ── */}
      <View style={styles.header}>
        <View style={{ width: 44 }} />
        <Text style={styles.headerTitle}>{t.vision_title}</Text>
        <TouchableOpacity
          onPress={() => Alert.alert(
            isRTL ? 'مشاركة' : 'Share',
            isRTL ? 'تم نسخ رابط لوحتك البصرية' : 'Link to your vision board copied'
          )}
          style={styles.headerBtn}
        >
          <Share2 size={18} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.board}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          /* ── Empty Board State ── */
          <View style={styles.emptyBoard}>
            {/* Single "starter" pinned note */}
            <View style={[styles.emptyCard, { transform: [{ rotate: '-2deg' }] }]}>
              <View style={[styles.pinDot, { backgroundColor: '#6C5CE7', top: -8, alignSelf: 'center' }]} />
              <Text style={styles.emptyCardEmoji}>💬</Text>
              <Text style={styles.emptyCardTitle}>{t.vision_empty_title}</Text>
              <Text style={styles.emptyCardText}>{t.vision_empty_text}</Text>
              <TouchableOpacity onPress={() => onNavigate('chat')} style={styles.emptyCardBtn}>
                <MessageSquare size={14} color="#6C5CE7" />
                <Text style={styles.emptyCardBtnText}>{t.vision_empty_btn}</Text>
              </TouchableOpacity>
            </View>

            {/* Mascot row */}
            <View style={styles.mascotRow}>
              <View style={styles.mascotBubble}>
                <Text style={styles.mascotText}>
                  {isRTL ? 'كل رحلة تبدأ بخطوة أولى... ابدأ الآن! ✨' : 'Every journey starts with a first step... Start now! ✨'}
                </Text>
                <View style={styles.bubbleTail} />
              </View>
              <Mascot size={58} />
            </View>
          </View>
        ) : (
          /* ── Goals Board ── */
          <>
            {/* Progress summary card */}
            {focusGoal && (
              <View style={styles.progressCard}>
                <View style={[styles.pinDot, { backgroundColor: '#EF4444', top: -8, left: 24 }]} />
                <View style={[styles.pinDot, { backgroundColor: '#EF4444', top: -8, right: 24 }]} />
                <Text style={styles.progressCardTitle}>{t.vision_progress}</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressBadgeText}>
                      {completedCount}/{totalCount} {t.vision_total_tasks}
                    </Text>
                  </View>
                  <Text style={styles.progressPercent}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` as any }]} />
                </View>
                <Text style={styles.progressGoalText} numberOfLines={1}>
                  🎯 {focusGoal.text}
                </Text>
              </View>
            )}

            {/* Goal pins — render in explicit rows of 2 */}
            <View style={styles.pinsSection}>
              {(() => {
                // Build the item list: all goals + the add-pin at the end
                type PinItem =
                  | { type: 'goal'; goal: GoalPin }
                  | { type: 'add' };
                const items: PinItem[] = [
                  ...goals.map((g): PinItem => ({ type: 'goal', goal: g })),
                  { type: 'add' },
                ];

                // Group into rows of 2
                const rows: PinItem[][] = [];
                for (let i = 0; i < items.length; i += 2) {
                  rows.push(items.slice(i, Math.min(i + 2, items.length)));
                }

                return rows.map((row, rowIdx) => (
                  <View key={rowIdx} style={styles.pinRow}>
                    {row.map((item, colIdx) => {
                      if (item.type === 'add') {
                        return (
                          <TouchableOpacity
                            key="add"
                            onPress={() => onNavigate('chat')}
                            style={[styles.goalPin, styles.addPin, { transform: [{ rotate: '1.5deg' }] }]}
                            activeOpacity={0.8}
                          >
                            <Plus size={28} color="#6C5CE7" />
                            <Text style={styles.addPinText}>{t.vision_new_goal}</Text>
                          </TouchableOpacity>
                        );
                      }
                      const goal = item.goal;
                      const goalCompleted = goal.tasks.filter((t) => t.completed).length;
                      const goalTotal = goal.tasks.length;
                      const goalPct = goalTotal > 0 ? Math.round((goalCompleted / goalTotal) * 100) : 0;
                      const isActive = goal.id === (activeGoalId ?? focusGoal?.id);
                      return (
                        <TouchableOpacity
                          key={goal.id}
                          onPress={() => onGoalPress(goal)}
                          style={[
                            styles.goalPin,
                            {
                              // In dark mode the pastel goal.color is blinding — use dark walnut base
                              backgroundColor: theme === 'dark' ? '#2C1A0E' : goal.color,
                              transform: [{ rotate: `${goal.rotation}deg` }],
                              // Subtle left accent border using goal's pin color for identity
                              ...(theme === 'dark' ? { borderLeftWidth: 3, borderLeftColor: goal.pinColor } : {}),
                            },
                            isActive && { borderWidth: 2.5, borderColor: '#00BFA6' },
                          ]}
                          activeOpacity={0.85}
                          onLongPress={() => {
                            setTaskModalGoal(goal);
                            setIsEditing(false);
                            setEditGoalText(goal.text);
                          }}
                        >
                          <View style={[styles.pinDot, { backgroundColor: goal.pinColor, top: -8, alignSelf: 'center' }]} />
                          {/* Active goal star badge */}
                          {isActive && (
                            <View style={styles.activeBadge}>
                              <Text style={styles.activeBadgeText}>
                                {isRTL ? '⭐ نشط' : '⭐ Active'}
                              </Text>
                            </View>
                          )}
                          <Text style={styles.goalPinEmoji}>{goal.emoji}</Text>
                          <Text style={styles.goalPinText} numberOfLines={2}>{goal.text}</Text>
                          <View style={styles.goalPinBar}>
                            <View style={[styles.goalPinBarFill, { width: `${goalPct}%` as any, backgroundColor: goal.pinColor }]} />
                          </View>
                          <View style={styles.goalPinFooter}>
                            <Text style={styles.goalPinHint}>{t.vision_tap_journey}</Text>
                            <Text style={styles.goalPinCount}>{goalCompleted}/{goalTotal}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    {/* Fill empty slot in last row with a spacer */}
                    {row.length === 1 && <View style={styles.goalPinSpacer} />}
                  </View>
                ));
              })()}
            </View>

            {/* Mascot row */}
            <View style={styles.mascotRow}>
              <View style={styles.mascotBubble}>
                <Text style={styles.mascotText}>
                  {goals.length >= 2
                    ? t.vision_mascot_multi.replace('{n}', String(goals.length))
                    : t.vision_mascot_single}
                </Text>
                <View style={styles.bubbleTail} />
              </View>
              <Mascot size={58} />
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Today's Task Bar (above tab bar) ── */}
      {focusGoal && (
        <View style={styles.taskBar}>
          <TouchableOpacity onPress={handleCompleteTask} style={styles.taskCheckBtn}>
            <Check size={15} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.taskBarCenter}>
            <Text style={styles.taskBarLabel}>
              {t.vision_today_task} · {focusGoal.emoji} {focusGoal.text.substring(0, 18)}...
            </Text>
            <Text style={styles.taskBarText} numberOfLines={1}>
              {firstIncompleteTask ? firstIncompleteTask.text : t.vision_task_done}
            </Text>
          </View>

          <TouchableOpacity onPress={() => onGoalPress(focusGoal)} style={styles.taskBarBtn}>
            <Text style={styles.taskBarBtnText}>{t.vision_journey_btn}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Tasks Quick-View Modal (long press on a pin) ── */}
      <Modal
        animationType="slide"
        transparent
        visible={taskModalGoal !== null}
        onRequestClose={() => setTaskModalGoal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <TouchableOpacity onPress={() => setTaskModalGoal(null)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>

                {taskModalGoal && (
                  isEditing ? (
                    <>
                      <TouchableOpacity onPress={handleEditSave}>
                        <Check size={20} color="#00BFA6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setIsEditing(false)}>
                        <X size={20} color="#64748B" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Pencil size={18} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleDelete}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </>
                  )
                )}
              </View>

              {isEditing ? (
                <TextInput
                  style={styles.modalTitleInput}
                  value={editGoalText}
                  onChangeText={setEditGoalText}
                  autoFocus
                  maxLength={60}
                />
              ) : (
                <Text style={styles.modalTitle}>
                  {taskModalGoal?.emoji} {taskModalGoal?.text}
                </Text>
              )}
            </View>

            {taskModalGoal && (
              <>
                <View style={styles.modalProgressRow}>
                  <View style={styles.modalProgressBar}>
                    <View style={[styles.modalProgressFill, {
                      width: `${taskModalGoal.tasks.length > 0
                        ? Math.round((taskModalGoal.tasks.filter(t => t.completed).length / taskModalGoal.tasks.length) * 100)
                        : 0}%` as any
                    }]} />
                  </View>
                  <Text style={styles.modalProgressLabel}>
                    {taskModalGoal.tasks.filter(t => t.completed).length}/{taskModalGoal.tasks.length}
                  </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {taskModalGoal.tasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => toggleModalTask(taskModalGoal.id, task.id, task.completed)}
                      style={[styles.taskRow, task.completed && styles.taskRowDone]}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
                        {task.completed && <Check size={11} color="white" />}
                      </View>
                      <Text style={[styles.taskText, task.completed && styles.taskTextDone]}>
                        {task.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => { setTaskModalGoal(null); onGoalPress(taskModalGoal); }}
                  style={styles.modalJourneyBtn}
                >
                  <Text style={styles.modalJourneyBtnText}>{t.journey_view_all} {isRTL ? '←' : '→'}</Text>
                </TouchableOpacity>

                {/* Set as Active Goal button */}
                {taskModalGoal.id !== (activeGoalId ?? focusGoal?.id) && (
                  <TouchableOpacity
                    onPress={async () => {
                      setTaskModalGoal(null);
                      await onSetActiveGoal(taskModalGoal.id);
                    }}
                    style={styles.setActiveBtn}
                  >
                    <Text style={styles.setActiveBtnText}>
                      {isRTL ? '⭐ تعيين كهدف نشط' : '⭐ Set as Active Goal'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Theme-aware styles ────────────────────────────────────────────────────────
function makeStyles(colors: Colors, theme: 'light' | 'dark') {
  // Cork-specific surface: warm cream in light, dark walnut in dark
  const corkCard     = theme === 'light' ? '#FFFDE7' : '#2C1A0E';
  const corkCardText = theme === 'light' ? '#1E293B' : '#E8D5C0';
  const corkCardSub  = theme === 'light' ? '#64748B' : '#A08060';
  const addPinBg     = theme === 'light' ? 'rgba(255,255,255,0.55)' : 'rgba(60,35,15,0.6)';
  const mascotBubBg  = theme === 'light' ? '#FFFFFF' : '#2C1A0E';
  const mascotBubTxt = theme === 'light' ? '#5856D6' : '#B39DFF';
  const bubbleTailClr= theme === 'light' ? '#FFFFFF' : '#2C1A0E';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.corkBg,
    },

    /* Header */
    header: {
      height: Platform.OS === 'ios' ? 76 : 60,
      backgroundColor: colors.corkHeader,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 20 : 0,
      borderBottomWidth: 3,
      borderColor: theme === 'light' ? '#6B340F' : '#1A0A03',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 6,
    },
    headerBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Cairo_700Bold',
      color: '#FFFFFF',
    },

    /* Board scroll */
    board: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 200,
      alignItems: 'center',
    },

    /* Progress summary card */
    progressCard: {
      width: '100%',
      backgroundColor: theme === 'light' ? '#5856D6' : '#3A3080',
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 7,
    },
    progressCardTitle: {
      fontSize: 12,
      fontFamily: 'Cairo_600SemiBold',
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      marginBottom: 10,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    progressBadge: {
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    progressBadgeText: {
      fontSize: 11,
      fontFamily: 'Cairo_600SemiBold',
      color: '#FFFFFF',
    },
    progressPercent: {
      fontSize: 26,
      fontFamily: 'Cairo_700Bold',
      color: '#FFFFFF',
    },
    progressTrack: {
      height: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 12,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#F5C44B',
      borderRadius: 4,
    },
    progressGoalText: {
      fontSize: 12,
      fontFamily: 'Cairo_600SemiBold',
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'right',
    },

    /* Pins section */
    pinsSection: {
      width: '100%',
      marginBottom: 24,
    },
    pinRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    goalPinSpacer: {
      width: CARD_W,
    },

    /* Individual goal pin card */
    goalPin: {
      width: CARD_W,
      minHeight: 170,
      backgroundColor: corkCard,
      padding: 14,
      borderRadius: 4,
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 6 },
      shadowOpacity: theme === 'light' ? 0.22 : 0.45,
      shadowRadius: 8,
      elevation: 5,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    goalPinEmoji: {
      fontSize: 36,
      marginTop: 8,
    },
    goalPinText: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      // light: warm dark brown — harmonious on any pastel
      // dark: warm parchment — readable on dark walnut
      color: theme === 'light' ? '#3B2008' : '#E8D5C0',
      textAlign: 'center',
      lineHeight: 20,
    },
    goalPinBar: {
      width: '100%',
      height: 4,
      backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 4,
    },
    goalPinBarFill: {
      height: '100%',
      borderRadius: 2,
    },
    goalPinFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 2,
    },
    goalPinCount: {
      fontSize: 10,
      fontFamily: 'Cairo_700Bold',
      color: theme === 'light' ? '#7A4B1A' : '#A08060',
    },
    goalPinHint: {
      fontSize: 9,
      fontFamily: 'Cairo_400Regular',
      color: theme === 'light' ? '#9B6A30' : '#856040',
    },

    /* Add goal pin */
    addPin: {
      backgroundColor: addPinBg,
      borderWidth: 2,
      borderColor: 'rgba(108,92,231,0.35)',
      borderStyle: 'dashed',
      shadowOpacity: 0.08,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    addPinText: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      color: '#6C5CE7',
    },

    /* Push pin dot */
    pinDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 2,
      elevation: 3,
    },

    /* Empty board */
    emptyBoard: {
      width: '100%',
      alignItems: 'center',
      gap: 24,
    },
    emptyCard: {
      width: width * 0.68,
      backgroundColor: corkCard,
      borderRadius: 4,
      padding: 24,
      alignItems: 'center',
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 6 },
      shadowOpacity: theme === 'light' ? 0.22 : 0.45,
      shadowRadius: 8,
      elevation: 5,
      position: 'relative',
    },
    emptyCardEmoji: { fontSize: 40 },
    emptyCardTitle: {
      fontSize: 18,
      fontFamily: 'Cairo_700Bold',
      color: corkCardText,
    },
    emptyCardText: {
      fontSize: 13,
      fontFamily: 'Cairo_400Regular',
      color: corkCardSub,
      textAlign: 'center',
      lineHeight: 22,
    },
    emptyCardBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme === 'light' ? '#EEF2FF' : 'rgba(108,92,231,0.2)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      marginTop: 4,
    },
    emptyCardBtnText: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      color: '#6C5CE7',
    },

    /* Mascot */
    mascotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
    },
    mascotBubble: {
      flex: 1,
      backgroundColor: mascotBubBg,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === 'light' ? 0.12 : 0.4,
      shadowRadius: 8,
      elevation: 3,
      position: 'relative',
    },
    mascotText: {
      fontSize: 12,
      fontFamily: 'Cairo_700Bold',
      color: mascotBubTxt,
      textAlign: 'right',
      lineHeight: 20,
    },
    bubbleTail: {
      position: 'absolute',
      right: -8,
      top: '50%',
      marginTop: -6,
      width: 0,
      height: 0,
      borderTopWidth: 6,
      borderBottomWidth: 6,
      borderLeftWidth: 8,
      borderStyle: 'solid',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: bubbleTailClr,
    },


    /* Task bar */
    taskBar: {
      position: 'absolute',
      bottom: 70,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.corkTaskBar,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderTopWidth: 2,
      borderColor: theme === 'light' ? '#6B3A1A' : '#1A0A03',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: theme === 'light' ? 0.25 : 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
    taskCheckBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#00BFA6',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#00BFA6',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 3,
    },
    taskBarCenter: {
      flex: 1,
      alignItems: 'flex-end',
    },
    taskBarLabel: {
      fontSize: 9,
      fontFamily: 'Cairo_600SemiBold',
      color: 'rgba(255,255,255,0.55)',
    },
    taskBarText: {
      fontSize: 12,
      fontFamily: 'Cairo_700Bold',
      color: '#FFFFFF',
      marginTop: 2,
    },
    taskBarBtn: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    taskBarBtnText: {
      fontSize: 11,
      fontFamily: 'Cairo_700Bold',
      color: '#FFFFFF',
    },

    /* Modal */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: 40,
      maxHeight: '78%',
    },
    modalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderLight,
      alignSelf: 'center',
      marginBottom: 18,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 15,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
      flex: 1,
      textAlign: 'right',
      paddingRight: 12,
    },
    modalTitleInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textPrimary,
      textAlign: 'right',
      paddingRight: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.accent,
      paddingVertical: 2,
    },
    modalProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    modalProgressBar: {
      flex: 1,
      height: 8,
      backgroundColor: colors.borderLight,
      borderRadius: 4,
      overflow: 'hidden',
    },
    modalProgressFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 4,
    },
    modalProgressLabel: {
      fontSize: 12,
      fontFamily: 'Cairo_700Bold',
      color: colors.accent,
    },
    taskRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
    },
    taskRowDone: { opacity: 0.45 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    checkboxDone: {
      backgroundColor: '#00BFA6',
      borderColor: '#00BFA6',
    },
    taskText: {
      flex: 1,
      fontSize: 13,
      fontFamily: 'Cairo_400Regular',
      color: colors.textSecondary,
      textAlign: 'right',
    },
    taskTextDone: {
      textDecorationLine: 'line-through',
      color: colors.textMuted,
    },
    modalJourneyBtn: {
      backgroundColor: theme === 'light' ? '#F3F0FF' : 'rgba(108,92,231,0.18)',
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 8,
    },
    modalJourneyBtnText: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      color: colors.accent,
    },
    setActiveBtn: {
      borderWidth: 1.5,
      borderColor: colors.accentAlt,
      borderRadius: 14,
      paddingVertical: 11,
      alignItems: 'center',
    },
    setActiveBtnText: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      color: colors.accentAlt,
    },
    activeBadge: {
      alignSelf: 'center',
      backgroundColor: 'rgba(0,191,166,0.18)',
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 2,
      marginBottom: 4,
    },
    activeBadgeText: {
      fontSize: 10,
      fontFamily: 'Cairo_700Bold',
      color: theme === 'light' ? '#006B5E' : '#00D4BA',
    },
  });
}

