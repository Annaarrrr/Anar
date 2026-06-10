import React, { useState, useRef, useMemo } from 'react';
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
} from 'react-native';
import { Lock, Check, X, ArrowRight } from 'lucide-react-native';
import { GoalPin, Task } from '../types';
import { api } from '../services/api';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const SPINE_X = width / 2;

interface Props {
  goal: GoalPin;
  onBack: () => void;
  refreshGoals: () => Promise<void>;
}

type NodeStatus = 'completed' | 'active' | 'locked';

export function JourneyMapScreen({ goal, onBack, refreshGoals }: Props) {
  const { colors, theme, language } = useAppSettings();
  const isRTL = language === 'ar';

  // Bilingual UI strings
  const jt = {
    headerLabel:   isRTL ? 'خريطة رحلة'                              : 'Journey Map',
    finish:        isRTL ? 'نهاية المسار'                            : 'Finish Line',
    start:         isRTL ? 'البداية'                                : 'Start',
    now:           isRTL ? 'الآن ⚡'                                  : 'NOW ⚡',
    badgeDone:     isRTL ? 'مكتمل ✓'                                : 'Done ✓',
    badgeActive:   isRTL ? 'نشط ⚡'                                  : 'Active ⚡',
    badgeLocked:   isRTL ? 'مقفل 🔒'                                : 'Locked 🔒',
    lockMsg:       isRTL ? 'أكمل مهام المرحلة الحالية أولاً لإلغاء القفل' : 'Complete current stage tasks to unlock',
    preDone:       isRTL ? '✓ هذه المرحلة مكتملة' : '✓ This stage is completed',
    moreTasks:     (n: number) => isRTL ? `+ ${n} مهام أخرى` : `+ ${n} more tasks`,
    viewAll:       isRTL ? 'عرض خريطة المهام الكاملة'     : 'View all tasks',
    alertErr:      isRTL ? 'خطأ'                                       : 'Error',
    alertErrMsg:   isRTL ? 'فشل تحديث المهمة'                    : 'Failed to update task',
  };

  // Dynamic styles for the drawer/modal (theme-aware)
  const dynStyles = useMemo(() => StyleSheet.create({
    drawer: {
      position: 'absolute' as const,
      bottom: 0, left: 0, right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: theme === 'light' ? 0.15 : 0.4,
      shadowRadius: 16,
      elevation: 12,
    },
    drawerHandle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
    drawerTitle:     { fontSize: 15, fontFamily: 'Cairo_700Bold', color: colors.textPrimary },
    drawerBorderBottom: { borderColor: colors.borderLight },
    drawerLockText:  { fontSize: 13, fontFamily: 'Cairo_600SemiBold', color: colors.textSecondary, textAlign: 'center' as const, paddingHorizontal: 20, lineHeight: 22 },
    drawerLockIcon:  { width: 52, height: 52, borderRadius: 26, backgroundColor: theme === 'light' ? '#F3F0FF' : 'rgba(108,92,231,0.18)', alignItems: 'center' as const, justifyContent: 'center' as const },
    drawerPreText:   { fontSize: 13, fontFamily: 'Cairo_600SemiBold', color: colors.accentAlt, textAlign: 'center' as const },
    drawerCheck:     { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.surface },
    drawerTaskText:  { flex: 1, fontSize: 13, fontFamily: 'Cairo_400Regular', color: colors.textSecondary, textAlign: 'right' as const },
    drawerBorderRow: { borderColor: colors.borderLight },
    drawerMoreText:  { fontSize: 12, fontFamily: 'Cairo_600SemiBold', color: colors.accent },
    drawerFullBtn:   { marginTop: 14, backgroundColor: theme === 'light' ? '#F3F0FF' : 'rgba(108,92,231,0.18)', borderRadius: 14, paddingVertical: 10, alignItems: 'center' as const },
    drawerFullBtnText: { fontSize: 13, fontFamily: 'Cairo_700Bold', color: colors.accent },
    modalSheet:      { backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, maxHeight: '78%' as any },
    modalHandle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderLight, alignSelf: 'center' as const, marginBottom: 18 },
    modalTitle:      { fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary, flex: 1, textAlign: 'right' as const, paddingRight: 12 },
    modalProgressBar: { flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' as const },
    mCheckbox:       { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.surface },
    mTaskText:       { flex: 1, fontSize: 13, fontFamily: 'Cairo_400Regular', color: colors.textSecondary, textAlign: 'right' as const },
    mBorderRow:      { borderColor: colors.borderLight },
  }), [colors, theme]);

  // closeIconColor is a plain value, not a style object
  const closeIconColor = colors.textMuted;

  const [tasks, setTasks] = useState<Task[]>(goal.tasks);
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);

  const handleContentSizeChange = () => {
    if (!hasScrolledRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
      hasScrolledRef.current = true;
    }
  };

  // ── Stage status logic ─────────────────────────────────────────────────────
  // Distribute all tasks across all stages (0..4) and unlock sequentially
  const N = tasks.length;

  const getTasksForStage = (stageIdx: number): Task[] => {
    const numStages = 5;
    const base = Math.floor(N / numStages);
    const extra = N % numStages;
    
    let startIdx = 0;
    for (let i = 0; i < stageIdx; i++) {
      startIdx += base + (i < extra ? 1 : 0);
    }
    const count = base + (stageIdx < extra ? 1 : 0);
    return tasks.slice(startIdx, startIdx + count);
  };

  const getStatus = (stageIdx: number): NodeStatus => {
    const stageTasks = getTasksForStage(stageIdx);
    const allDone = stageTasks.length > 0 && stageTasks.every((t) => t.completed);

    if (stageIdx === 0) {
      return allDone ? 'completed' : 'active';
    }

    // Unlock stage N when stage N-1 is completed
    const prevStatus = getStatus(stageIdx - 1);
    if (prevStatus !== 'completed') {
      return 'locked';
    }
    return allDone ? 'completed' : 'active';
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // stages displayed top→bottom = advanced→beginner (reversed)
  const displayedStages = [...goal.stages].reverse(); // index 0 in display = stage 4 (most advanced)
  const toRealIdx = (displayIdx: number) => goal.stages.length - 1 - displayIdx;

  const handleNodePress = (displayIdx: number) => {
    const realIdx = toRealIdx(displayIdx);
    setSelectedStageIdx(realIdx);
    setDrawerVisible(true);
  };

  const toggleTask = async (taskId: string, currentlyCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentlyCompleted } : t))
    );
    try {
      await api.toggleTask(taskId, !currentlyCompleted);
      await refreshGoals();
    } catch {
      Alert.alert(jt.alertErr, jt.alertErrMsg);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: currentlyCompleted } : t))
      );
    }
  };

  // Drawer content for selected stage
  const drawerStage = selectedStageIdx !== null ? goal.stages[selectedStageIdx] : null;
  const drawerStatus = selectedStageIdx !== null ? getStatus(selectedStageIdx) : 'locked';
  const drawerTasks = selectedStageIdx !== null ? getTasksForStage(selectedStageIdx) : [];

  const lockReasons = [
    '',
    jt.lockMsg,
    jt.lockMsg,
    jt.lockMsg,
    jt.lockMsg,
  ];

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: goal.pinColor + '55' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Goal-colored left accent bar */}
          <View style={[styles.headerAccent, { backgroundColor: goal.pinColor }]} />
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerLabel}>{jt.headerLabel}</Text>
            <Text style={styles.headerGoal} numberOfLines={1}>{goal.emoji} {goal.text}</Text>
            <View style={styles.headerBarTrack}>
              <View style={[styles.headerBarFill, { width: `${progressPercent}%` as any, backgroundColor: goal.pinColor }]} />
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerPercent, { color: goal.pinColor }]}>{progressPercent}%</Text>
          <Text style={styles.headerTasks}>{completedCount}/{tasks.length}</Text>
        </View>
      </View>

      {/* ── Scrollable Roadmap ── */}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={styles.mapContent}
        style={[styles.mapScroll, { marginBottom: drawerVisible ? 270 : 0 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Finish banner */}
        <View style={styles.finishBanner}>
          <Text style={styles.finishEmoji}>🏆</Text>
          <Text style={styles.finishText}>{jt.finish}</Text>
        </View>

        {/* Spine */}
        <View style={styles.spine} />

        {/* Nodes (top = most advanced, bottom = earliest) */}
        {displayedStages.map((stage, displayIdx) => {
          const realIdx = toRealIdx(displayIdx);
          const status = getStatus(realIdx);
          const isRight = displayIdx % 2 === 0;

          return (
            <View key={stage.id} style={styles.nodeRow}>
              {displayIdx > 0 && <View style={styles.connectorDash} />}

              <TouchableOpacity
                onPress={() => handleNodePress(displayIdx)}
                style={[
                  styles.nodeButton,
                  isRight ? styles.nodeButtonRight : styles.nodeButtonLeft,
                ]}
                activeOpacity={0.75}
              >
                {/* Label side */}
                <View style={[isRight ? styles.nodeLabelRight : styles.nodeLabelLeft]}>
                  {status === 'active' && (
                    <View style={[styles.nowBadge, { backgroundColor: goal.pinColor }]}>
                      <Text style={styles.nowBadgeText}>{jt.now}</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.nodeLabel,
                    status === 'completed' && styles.nodeLabelDone,
                    status === 'active'    && styles.nodeLabelActive,
                    status === 'locked'    && styles.nodeLabelLocked,
                  ]}>
                    {stage.label}
                  </Text>
                  <Text style={styles.nodeSub}>{stage.sublabel}</Text>
                </View>

                {/* Circle */}
                <View style={[
                  styles.nodeCircle,
                  status === 'completed' && styles.nodeCompleted,
                  status === 'active'    && { ...styles.nodeActive, backgroundColor: goal.pinColor, shadowColor: goal.pinColor },
                  status === 'locked'    && styles.nodeLocked,
                  selectedStageIdx === realIdx && drawerVisible && styles.nodeSelected,
                ]}>
                  {status === 'completed' && <Check size={18} color="#FFFFFF" />}
                  {status === 'active'    && <Text style={styles.nodeEmoji}>{stage.emoji}</Text>}
                  {status === 'locked'    && <Lock size={15} color="#4A4875" />}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Start marker */}
        <View style={styles.startMarker}>
          <View style={styles.startDot} />
          <Text style={styles.startText}>{jt.start}</Text>
        </View>
      </ScrollView>

      {/* ── Bottom Drawer ── */}
      {drawerVisible && drawerStage && (
        <View style={dynStyles.drawer}>
          <View style={styles.drawerTopRow}>
            <View style={dynStyles.drawerHandle} />
            <TouchableOpacity onPress={() => setDrawerVisible(false)} style={styles.drawerCloseBtn}>
              <X size={16} color={closeIconColor} />
            </TouchableOpacity>
          </View>

          {/* Stage header */}
          <View style={[styles.drawerTitleRow, dynStyles.drawerBorderBottom]}>
            <Text style={styles.drawerEmoji}>{drawerStage.emoji}</Text>
            <View style={styles.drawerTitleBlock}>
              <View style={[
                styles.drawerBadge,
                drawerStatus === 'completed' && styles.drawerBadgeDone,
                drawerStatus === 'locked'    && styles.drawerBadgeLocked,
              ]}>
                <Text style={[
                  styles.drawerBadgeText,
                  drawerStatus === 'completed' && styles.drawerBadgeTextDone,
                  drawerStatus === 'locked'    && styles.drawerBadgeTextLocked,
                ]}>
                  {drawerStatus === 'completed' ? jt.badgeDone
                   : drawerStatus === 'active'  ? jt.badgeActive
                   : jt.badgeLocked}
                </Text>
              </View>
              <Text style={dynStyles.drawerTitle}>{drawerStage.label}</Text>
            </View>
          </View>

          {/* Locked */}
          {drawerStatus === 'locked' ? (
            <View style={styles.drawerLocked}>
              <View style={dynStyles.drawerLockIcon}>
                <Lock size={22} color={colors.accent} />
              </View>
              <Text style={dynStyles.drawerLockText}>
                {lockReasons[selectedStageIdx ?? 0]}
              </Text>
            </View>
          ) : drawerTasks.length === 0 ? (
            <View style={styles.drawerPreCompleted}>
              <Text style={dynStyles.drawerPreText}>{jt.preDone}</Text>
            </View>
          ) : (
            <View>
              {drawerTasks.slice(0, 3).map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleTask(task.id, task.completed)}
                  style={[styles.drawerTask, dynStyles.drawerBorderRow, task.completed && styles.drawerTaskDone]}
                  activeOpacity={0.7}
                >
                  <View style={[dynStyles.drawerCheck, task.completed && styles.drawerCheckDone]}>
                    {task.completed && <Check size={10} color="white" />}
                  </View>
                  <Text style={[dynStyles.drawerTaskText, task.completed && styles.drawerTaskTextDone]}>
                    {task.text}
                  </Text>
                </TouchableOpacity>
              ))}

              {drawerTasks.length > 3 && (
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.drawerMoreBtn}>
                  <Text style={dynStyles.drawerMoreText}>{jt.moreTasks(drawerTasks.length - 3)}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => setModalVisible(true)} style={dynStyles.drawerFullBtn}>
                <Text style={dynStyles.drawerFullBtnText}>{jt.viewAll}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── All Tasks Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={dynStyles.modalSheet}>
            <View style={dynStyles.modalHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={closeIconColor} />
              </TouchableOpacity>
              <Text style={dynStyles.modalTitle}>{goal.emoji} {goal.text}</Text>
            </View>

            <View style={styles.modalProgressRow}>
              <View style={dynStyles.modalProgressBar}>
                <View style={[styles.modalProgressFill, { width: `${progressPercent}%` as any }]} />
              </View>
              <Text style={styles.modalProgressLabel}>{progressPercent}%</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleTask(task.id, task.completed)}
                  style={[styles.mTaskRow, dynStyles.mBorderRow, task.completed && styles.mTaskRowDone]}
                  activeOpacity={0.7}
                >
                  <View style={[dynStyles.mCheckbox, task.completed && styles.mCheckboxDone]}>
                    {task.completed && <Check size={11} color="white" />}
                  </View>
                  <Text style={[dynStyles.mTaskText, task.completed && styles.mTaskTextDone]}>
                    {task.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E2A',
  },

  /* Header */
  header: {
    height: Platform.OS === 'ios' ? 80 : 62,
    backgroundColor: '#16153A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 18 : 0,
    gap: 10,
    borderBottomWidth: 1,
    borderColor: '#1E1D47',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAccent: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 2,
    flexShrink: 0,
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  headerLabel: {
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    color: '#5C5B94',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  headerGoal: {
    fontSize: 13,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  headerBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#1E1D47',
    borderRadius: 2,
    overflow: 'hidden',
  },
  headerBarFill: {
    height: '100%',
    backgroundColor: '#00BFA6',
    borderRadius: 2,
  },
  headerRight: {
    alignItems: 'center',
    minWidth: 40,
  },
  headerPercent: {
    fontSize: 16,
    fontFamily: 'Cairo_700Bold',
    color: '#00BFA6',
  },
  headerTasks: {
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    color: '#5C5B94',
    marginTop: 2,
  },

  /* Map scroll */
  mapScroll: { flex: 1 },
  mapContent: {
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },

  /* Spine */
  spine: {
    position: 'absolute',
    top: 80,
    bottom: 80,
    width: 3,
    backgroundColor: '#1E1D47',
    borderRadius: 2,
    left: SPINE_X - 1.5,
    zIndex: 0,
  },

  /* Finish/Start */
  finishBanner: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 2,
  },
  finishEmoji: { fontSize: 28, marginBottom: 4 },
  finishText: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    color: '#5C5B94',
    letterSpacing: 1,
  },
  startMarker: {
    alignItems: 'center',
    marginTop: 40,
    zIndex: 2,
  },
  startDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D2B52',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#3D3C6A',
  },
  startText: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    color: '#4A4875',
  },

  /* Nodes */
  nodeRow: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
    marginVertical: 14,
  },
  connectorDash: {
    width: 3,
    height: 50,
    backgroundColor: '#1E1D47',
    borderRadius: 2,
    marginBottom: 4,
  },
  nodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 28,
    gap: 14,
  },
  nodeButtonLeft:  { flexDirection: 'row',         justifyContent: 'flex-start' },
  nodeButtonRight: { flexDirection: 'row-reverse',  justifyContent: 'flex-start' },
  nodeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    flexShrink: 0,
  },
  nodeCompleted: {
    backgroundColor: '#00BFA6',
    borderColor: '#00BFA6',
    shadowColor: '#00BFA6',
  },
  nodeActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#FFFFFF',
    shadowColor: '#6C5CE7',
  },
  nodeLocked: {
    backgroundColor: '#16153A',
    borderColor: '#2D2B52',
    shadowColor: 'transparent',
  },
  nodeSelected: {
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  nodeEmoji: { fontSize: 22 },

  nodeLabelLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  nodeLabelRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  nodeLabel: {
    fontSize: 13,
    fontFamily: 'Cairo_700Bold',
  },
  nodeLabelDone:   { color: '#00BFA6' },
  nodeLabelActive: { color: '#FFFFFF', fontSize: 14 },
  nodeLabelLocked: { color: '#3D3C6A' },
  nodeSub: {
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    color: '#5C5B94',
    marginTop: 2,
  },
  nowBadge: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  nowBadgeText: {
    fontSize: 9,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },

  /* Drawer */
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  drawerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  drawerCloseBtn: { padding: 4 },
  drawerTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
  },
  drawerEmoji: { fontSize: 28 },
  drawerTitleBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  drawerBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  drawerBadgeDone:   { backgroundColor: '#F0FDF4' },
  drawerBadgeLocked: { backgroundColor: '#FEF2F2' },
  drawerBadgeText:     { fontSize: 10, fontFamily: 'Cairo_700Bold', color: '#6C5CE7' },
  drawerBadgeTextDone: { color: '#16A34A' },
  drawerBadgeTextLocked: { color: '#EF4444' },
  drawerTitle: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: '#1E293B',
  },
  drawerLocked: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  drawerLockIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLockText: {
    fontSize: 13,
    fontFamily: 'Cairo_600SemiBold',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  drawerPreCompleted: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  drawerPreText: {
    fontSize: 13,
    fontFamily: 'Cairo_600SemiBold',
    color: '#00BFA6',
    textAlign: 'center',
  },
  drawerTask: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  drawerTaskDone: { opacity: 0.4 },
  drawerCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  drawerCheckDone: {
    backgroundColor: '#00BFA6',
    borderColor: '#00BFA6',
  },
  drawerTaskText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Cairo_400Regular',
    color: '#334155',
    textAlign: 'right',
  },
  drawerTaskTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  drawerMoreBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
  drawerMoreText: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
    color: '#6C5CE7',
  },
  drawerFullBtn: {
    marginTop: 14,
    backgroundColor: '#F3F0FF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  drawerFullBtnText: {
    fontSize: 13,
    fontFamily: 'Cairo_700Bold',
    color: '#6C5CE7',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E2E8F0',
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
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
    paddingRight: 12,
  },
  modalProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  modalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 4,
  },
  modalProgressLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_700Bold',
    color: '#6C5CE7',
    minWidth: 36,
    textAlign: 'right',
  },
  mTaskRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  mTaskRowDone: { opacity: 0.4 },
  mCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  mCheckboxDone: {
    backgroundColor: '#00BFA6',
    borderColor: '#00BFA6',
  },
  mTaskText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Cairo_400Regular',
    color: '#334155',
    textAlign: 'right',
  },
  mTaskTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
});
