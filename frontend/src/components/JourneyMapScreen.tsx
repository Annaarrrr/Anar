import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import { Lock, Check, X, ArrowRight, ChevronRight, Trophy, Zap, Target } from 'lucide-react-native';
import { GoalPin, Task } from '../types';
import { api } from '../services/api';
import { useAppSettings } from '../context/AppContext';

const { width, height } = Dimensions.get('window');
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

  const jt = {
    headerLabel:   isRTL ? 'خريطة رحلة'                              : 'Journey Map',
    finish:        isRTL ? 'نهاية المسار'                            : 'Finish Line',
    start:         isRTL ? 'البداية'                                  : 'Start',
    now:           isRTL ? 'الآن ⚡'                                  : 'NOW ⚡',
    badgeDone:     isRTL ? 'مكتمل'                                    : 'Done',
    badgeActive:   isRTL ? 'نشط'                                      : 'Active',
    badgeLocked:   isRTL ? 'مقفل'                                     : 'Locked',
    lockMsg:       isRTL ? 'أكمل مهام المرحلة الحالية أولاً لإلغاء القفل' : 'Complete current stage tasks to unlock',
    moreTasks:     (n: number) => isRTL ? `+ ${n} مهام أخرى` : `+ ${n} more tasks`,
    viewAll:       isRTL ? 'عرض جميع المهام'                          : 'View All Tasks',
    alertErr:      isRTL ? 'خطأ'                                       : 'Error',
    alertErrMsg:   isRTL ? 'فشل تحديث المهمة'                        : 'Failed to update task',
    tasksFor:      isRTL ? 'مهام المرحلة'                            : 'Stage Tasks',
    complete:      isRTL ? 'أكملها اليوم ✓'                          : 'Mark Complete ✓',
    stageDone:     isRTL ? 'تهانينا! تم إتقان المرحلة 🎉'            : 'Stage Mastered! 🎉',
    proceedNext:   isRTL ? 'انطلق للمرحلة التالية →'                 : 'Proceed to Next Stage →',
    goalDone:      isRTL ? 'تم تحقيق الهدف بنجاح! 🎓'               : 'Goal Accomplished! 🎓',
    reviewTasks:   isRTL ? 'مراجعة المهام'                           : 'Review Tasks',
    streakDays:    isRTL ? 'يوم متتالي'                              : 'day streak',
    tasks:         isRTL ? 'مهمة'                                     : 'tasks',
    completed:     isRTL ? 'مكتملة'                                   : 'completed',
  };

  const [tasks, setTasks] = useState<Task[]>(goal.tasks);
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);

  // Animations
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(Array.from({ length: 20 }, () => new Animated.Value(1))).current;

  // Floating emoji particles
  interface FloatingEmojiParticle {
    id: string;
    emoji: string;
    x: number;
    y: number;
    animY: Animated.Value;
    animOpacity: Animated.Value;
    animScale: Animated.Value;
  }
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmojiParticle[]>([]);

  // Pulse animation for active node
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Drawer slide animation
  useEffect(() => {
    Animated.spring(drawerAnim, {
      toValue: drawerVisible ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [drawerVisible]);

  // Stage logic
  const N = tasks.length;
  const numStages = goal.stages.length;

  const getTasksForStage = useCallback((stageIdx: number): Task[] => {
    const base = Math.floor(N / numStages);
    const extra = N % numStages;
    let startIdx = 0;
    for (let i = 0; i < stageIdx; i++) {
      startIdx += base + (i < extra ? 1 : 0);
    }
    const count = base + (stageIdx < extra ? 1 : 0);
    return tasks.slice(startIdx, startIdx + count);
  }, [tasks, N, numStages]);

  const getStatus = useCallback((stageIdx: number): NodeStatus => {
    const stageTasks = getTasksForStage(stageIdx);
    const allDone = stageTasks.length > 0 && stageTasks.every((t) => t.completed);
    if (stageIdx === 0) return allDone ? 'completed' : 'active';
    const prevStatus = getStatus(stageIdx - 1);
    if (prevStatus !== 'completed') return 'locked';
    return allDone ? 'completed' : 'active';
  }, [getTasksForStage]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = N > 0 ? Math.round((completedCount / N) * 100) : 0;

  // Displayed: top = most advanced (reverse)
  const displayedStages = [...goal.stages].reverse();
  const toRealIdx = (displayIdx: number) => goal.stages.length - 1 - displayIdx;

  const handleNodePress = (displayIdx: number) => {
    const realIdx = toRealIdx(displayIdx);
    setSelectedStageIdx(realIdx);
    setShowCompletedTasks(false);
    setDrawerVisible(true);
  };

  const spawnEmojiBurst = (taskIndex: number) => {
    const emojis = ['🎉', '✨', '👍', '🔥', '🌟', '🎯'];
    const newParticles: FloatingEmojiParticle[] = [];
    const baseX = width / 2;
    const baseY = height * 0.55;

    for (let i = 0; i < 6; i++) {
      const id = Math.random().toString(36).substring(7);
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const x = baseX + (Math.random() * 120 - 60);
      const y = baseY + (Math.random() * 20 - 10);
      const animY = new Animated.Value(0);
      const animOpacity = new Animated.Value(1);
      const animScale = new Animated.Value(0.3);

      newParticles.push({ id, emoji, x, y, animY, animOpacity, animScale });
      Animated.parallel([
        Animated.timing(animY,       { toValue: -110 - Math.random() * 60, duration: 1000, useNativeDriver: true }),
        Animated.timing(animOpacity, { toValue: 0,  duration: 900,  useNativeDriver: true }),
        Animated.timing(animScale,   { toValue: 1.6, duration: 700, useNativeDriver: true }),
      ]).start(() => setFloatingEmojis((prev) => prev.filter((p) => p.id !== id)));
    }
    setFloatingEmojis((prev) => [...prev, ...newParticles]);
  };

  const toggleTask = async (taskId: string, currentlyCompleted: boolean, taskIndex: number = -1) => {
    if (taskIndex >= 0 && taskIndex < scaleAnims.length) {
      scaleAnims[taskIndex].setValue(1);
      Animated.sequence([
        Animated.timing(scaleAnims[taskIndex],  { toValue: 1.35, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnims[taskIndex],  { toValue: 1.0, friction: 4, tension: 40, useNativeDriver: true }),
      ]).start();
    }
    if (!currentlyCompleted && taskIndex >= 0) spawnEmojiBurst(taskIndex);

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

  const handleContentSizeChange = () => {
    if (!hasScrolledRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
      hasScrolledRef.current = true;
    }
  };

  const drawerStage = selectedStageIdx !== null ? goal.stages[selectedStageIdx] : null;
  const drawerStatus = selectedStageIdx !== null ? getStatus(selectedStageIdx) : 'locked';
  const drawerTasks = selectedStageIdx !== null ? getTasksForStage(selectedStageIdx) : [];
  const drawerProgress = drawerTasks.length > 0
    ? Math.round((drawerTasks.filter((t) => t.completed).length / drawerTasks.length) * 100)
    : 0;

  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <View style={styles.container}>
      {/* ── Gradient Background Layers ── */}
      <View style={styles.bgGrad1} />
      <View style={styles.bgGrad2} />
      <View style={styles.bgGrad3} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>{jt.headerLabel}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{goal.emoji} {goal.text}</Text>
        </View>
        <View style={styles.headerPct}>
          <Text style={[styles.headerPctNum, { color: goal.pinColor }]}>{progressPercent}%</Text>
        </View>
      </View>

      {/* ── Goal Summary Card ── */}
      <View style={[styles.goalCard, { borderColor: goal.pinColor + '33' }]}>
        {/* Left: text */}
        <View style={styles.goalCardLeft}>
          <Text style={styles.goalCardTitle} numberOfLines={2}>{goal.text}</Text>
          <Text style={styles.goalCardSub}>
            {completedCount}/{N} {jt.tasks} {jt.completed}
          </Text>
          <View style={styles.goalCardStreak}>
            <Zap size={11} color={goal.pinColor} />
            <Text style={[styles.goalCardStreakText, { color: goal.pinColor }]}>
              {isRTL ? `5 ${jt.streakDays}` : `5 ${jt.streakDays}`}
            </Text>
          </View>
        </View>

        {/* Right: circular progress ring */}
        <View style={styles.goalCardRight}>
          <View style={[styles.progressRingOuter, { borderColor: goal.pinColor + '22' }]}>
            <View style={[styles.progressRingInner, { borderColor: goal.pinColor }]}>
              <Text style={[styles.progressRingNum, { color: goal.pinColor }]}>{progressPercent}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Road Map Scroll ── */}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={[
          styles.mapContent,
          { paddingBottom: drawerVisible ? 320 : 60 },
        ]}
        style={styles.mapScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Finish banner */}
        <View style={styles.finishBanner}>
          <View style={[styles.finishIcon, { backgroundColor: goal.pinColor + '22' }]}>
            <Trophy size={18} color={goal.pinColor} />
          </View>
          <Text style={[styles.finishText, { color: goal.pinColor }]}>{jt.finish}</Text>
        </View>

        {/* Nodes */}
        {displayedStages.map((stage, displayIdx) => {
          const realIdx = toRealIdx(displayIdx);
          const status = getStatus(realIdx);
          const isRight = displayIdx % 2 === 0;

          return (
            <View key={stage.id} style={styles.nodeRow}>
              {/* Connector dash above each node (connects to banner above or previous node) */}
              <View style={[styles.connectorDash, { backgroundColor: goal.pinColor + '30' }]} />

              <TouchableOpacity
                onPress={() => handleNodePress(displayIdx)}
                style={[styles.nodeLayout, isRight ? styles.nodeLayoutRight : styles.nodeLayoutLeft]}
                activeOpacity={0.8}
              >
                {/* Label */}
                <View style={[styles.labelContainer, isRight ? styles.labelRight : styles.labelLeft]}>
                  {status === 'active' && (
                    <View style={[styles.nowBadge, { backgroundColor: goal.pinColor }]}>
                      <Text style={styles.nowBadgeText}>{jt.now}</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.nodeLabel,
                      status === 'completed' && { color: '#00BFA6' },
                      status === 'active'    && { color: '#FFFFFF', fontSize: 14 },
                      status === 'locked'    && { color: '#3D3C6A' },
                    ]}
                    numberOfLines={2}
                  >
                    {stage.label}
                  </Text>
                  <Text style={styles.nodeSub}>{stage.sublabel}</Text>
                </View>

                {/* Connector line from label to node */}
                <View style={[styles.connectorH, { backgroundColor: goal.pinColor + '30' }]} />

                {/* Node circle */}
                <View style={styles.nodeOrbitContainer}>
                  {status === 'active' ? (
                    <>
                      {/* Outer pulse ring */}
                      <Animated.View style={[
                        styles.nodeOrbit,
                        { borderColor: goal.pinColor + '55', transform: [{ scale: pulseAnim }] }
                      ]} />
                      {/* Node */}
                      <View style={[styles.nodeCircle, { backgroundColor: goal.pinColor, borderColor: '#FFFFFF', shadowColor: goal.pinColor }]}>
                        <Text style={styles.nodeEmoji}>{stage.emoji}</Text>
                      </View>
                    </>
                  ) : status === 'completed' ? (
                    <>
                      <View style={[styles.nodeCircle, styles.nodeCompleted]}>
                        <Check size={20} color="#FFFFFF" />
                      </View>
                    </>
                  ) : (
                    <View style={[styles.nodeCircle, styles.nodeLocked]}>
                      <Lock size={16} color="#4A4875" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Bottom connector from last node to start marker */}
        <View style={[styles.connectorDash, { backgroundColor: goal.pinColor + '30' }]} />

        {/* Start marker */}
        <View style={styles.startMarker}>
          <View style={[styles.startDot, { borderColor: goal.pinColor + '55', backgroundColor: goal.pinColor + '22' }]} />
          <Text style={styles.startText}>{jt.start}</Text>
        </View>
      </ScrollView>

      {/* ── Floating emojis ── */}
      {floatingEmojis.map((p) => (
        <Animated.Text
          key={p.id}
          pointerEvents="none"
          style={[
            styles.floatingEmoji,
            {
              left: p.x,
              top: p.y,
              transform: [{ translateY: p.animY }, { scale: p.animScale }],
              opacity: p.animOpacity,
            }
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}

      {/* ── Bottom Drawer ── */}
      {drawerVisible && drawerStage && (
        <Animated.View style={[styles.drawer, { transform: [{ translateY: drawerTranslateY }] }]}>
          {/* Handle */}
          <View style={styles.drawerHandle} />

          {/* Close */}
          <TouchableOpacity style={styles.drawerClose} onPress={() => setDrawerVisible(false)}>
            <X size={16} color="#5C5B94" />
          </TouchableOpacity>

          {/* Stage header */}
          <View style={styles.drawerHeader}>
            <View style={[styles.drawerEmojiBox, { backgroundColor: goal.pinColor + '22' }]}>
              <Text style={styles.drawerEmojiText}>{drawerStage.emoji}</Text>
            </View>
            <View style={styles.drawerHeaderText}>
              <View style={[
                styles.drawerBadge,
                drawerStatus === 'completed' && { backgroundColor: '#00BFA620' },
                drawerStatus === 'active'    && { backgroundColor: goal.pinColor + '22' },
                drawerStatus === 'locked'    && { backgroundColor: '#EF444420' },
              ]}>
                <Text style={[
                  styles.drawerBadgeText,
                  drawerStatus === 'completed' && { color: '#00BFA6' },
                  drawerStatus === 'active'    && { color: goal.pinColor },
                  drawerStatus === 'locked'    && { color: '#EF4444' },
                ]}>
                  {drawerStatus === 'completed' ? jt.badgeDone
                   : drawerStatus === 'active'  ? jt.badgeActive
                   : jt.badgeLocked}
                </Text>
              </View>
              <Text style={styles.drawerStageTitle}>{drawerStage.label}</Text>
            </View>
          </View>

          {/* Progress bar */}
          {drawerStatus !== 'locked' && (
            <View style={styles.drawerProgressRow}>
              <View style={styles.drawerProgressTrack}>
                <View style={[styles.drawerProgressFill, {
                  width: `${drawerProgress}%` as any,
                  backgroundColor: goal.pinColor,
                }]} />
              </View>
              <Text style={[styles.drawerProgressPct, { color: goal.pinColor }]}>{drawerProgress}%</Text>
            </View>
          )}

          {/* Locked */}
          {drawerStatus === 'locked' ? (
            <View style={styles.drawerLockedBody}>
              <View style={[styles.drawerLockIcon, { backgroundColor: goal.pinColor + '15' }]}>
                <Lock size={26} color={goal.pinColor} />
              </View>
              <Text style={styles.drawerLockText}>{jt.lockMsg}</Text>
            </View>

          ) : drawerStatus === 'completed' && !showCompletedTasks ? (
            /* Celebration */
            <View style={styles.celebrationBody}>
              <Text style={{ fontSize: 42 }}>🏆</Text>
              <Text style={styles.celebrationTitle}>{jt.stageDone}</Text>
              {selectedStageIdx !== null && selectedStageIdx < goal.stages.length - 1 ? (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStageIdx(selectedStageIdx + 1);
                    setShowCompletedTasks(false);
                  }}
                  style={[styles.celebrationBtn, { backgroundColor: goal.pinColor }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.celebrationBtnText}>{jt.proceedNext}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setDrawerVisible(false)}
                  style={[styles.celebrationBtn, { backgroundColor: '#6C5CE7' }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.celebrationBtnText}>{jt.goalDone}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowCompletedTasks(true)} style={styles.reviewLink}>
                <Text style={styles.reviewLinkText}>{jt.reviewTasks}</Text>
              </TouchableOpacity>
            </View>

          ) : (
            /* Task list */
            <View>
              <Text style={styles.tasksForLabel}>{jt.tasksFor}</Text>
              {drawerTasks.slice(0, 3).map((task, idx) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleTask(task.id, task.completed, idx)}
                  style={[
                    styles.taskRow,
                    { borderLeftColor: goal.pinColor },
                    task.completed && styles.taskRowDone,
                  ]}
                  activeOpacity={0.75}
                >
                  <Animated.View style={[styles.taskCheckWrap, { transform: [{ scale: scaleAnims[idx] }] }]}>
                    <View style={[
                      styles.taskCheck,
                      task.completed && { backgroundColor: goal.pinColor, borderColor: goal.pinColor },
                    ]}>
                      {task.completed && <Check size={11} color="#FFF" />}
                    </View>
                  </Animated.View>
                  <Text style={[styles.taskText, task.completed && styles.taskTextDone]}>
                    {task.text}
                  </Text>
                </TouchableOpacity>
              ))}

              {drawerTasks.length > 3 && (
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.moreBtn}>
                  <Text style={[styles.moreBtnText, { color: goal.pinColor }]}>
                    {jt.moreTasks(drawerTasks.length - 3)}
                  </Text>
                  <ChevronRight size={14} color={goal.pinColor} />
                </TouchableOpacity>
              )}

              {/* CTA */}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={[styles.ctaBtn, { backgroundColor: goal.pinColor }]}
                activeOpacity={0.85}
              >
                <Target size={16} color="#FFF" />
                <Text style={styles.ctaBtnText}>{jt.viewAll}</Text>
              </TouchableOpacity>

              {drawerStatus === 'completed' && showCompletedTasks && (
                <TouchableOpacity
                  onPress={() => setShowCompletedTasks(false)}
                  style={styles.reviewLink}
                >
                  <Text style={styles.reviewLinkText}>
                    {isRTL ? 'الرجوع لصفحة الإنجاز 🏆' : 'Back to Celebration Page 🏆'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      )}

      {/* ── All Tasks Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#5C5B94" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{goal.emoji} {goal.text}</Text>
            </View>

            {/* Progress */}
            <View style={styles.modalProgressRow}>
              <View style={styles.modalProgressTrack}>
                <View style={[styles.modalProgressFill, {
                  width: `${progressPercent}%` as any,
                  backgroundColor: goal.pinColor,
                }]} />
              </View>
              <Text style={[styles.modalProgressPct, { color: goal.pinColor }]}>{progressPercent}%</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {drawerTasks.map((task, idx) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleTask(task.id, task.completed, idx)}
                  style={[styles.mTaskRow, task.completed && styles.mTaskRowDone]}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.mCheckbox,
                    task.completed && { backgroundColor: goal.pinColor, borderColor: goal.pinColor },
                  ]}>
                    {task.completed && <Check size={12} color="#FFF" />}
                  </View>
                  <Text style={[styles.mTaskText, task.completed && styles.mTaskTextDone]}>
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
    backgroundColor: '#080816',
  },

  /* ── Background gradient simulation ── */
  bgGrad1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0D0B2B',
    opacity: 0.7,
  },
  bgGrad2: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#6C5CE7',
    opacity: 0.06,
  },
  bgGrad3: {
    position: 'absolute',
    bottom: 200,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#00BFA6',
    opacity: 0.04,
  },

  /* ── Header ── */
  header: {
    height: Platform.OS === 'ios' ? 90 : 64,
    paddingTop: Platform.OS === 'ios' ? 44 : 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  headerSub: {
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    color: '#5C5B94',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },
  headerPct: {
    alignItems: 'center',
  },
  headerPctNum: {
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
  },

  /* ── Goal Summary Card ── */
  goalCard: {
    marginHorizontal: 18,
    marginBottom: 8,
    borderRadius: 22,
    backgroundColor: '#13122E',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  goalCardLeft: {
    flex: 1,
    gap: 4,
  },
  goalCardTitle: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  goalCardSub: {
    fontSize: 11,
    fontFamily: 'Cairo_400Regular',
    color: '#5C5B94',
  },
  goalCardStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  goalCardStreakText: {
    fontSize: 11,
    fontFamily: 'Cairo_700Bold',
  },
  goalCardRight: {
    marginLeft: 16,
  },
  progressRingOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingNum: {
    fontSize: 13,
    fontFamily: 'Cairo_700Bold',
  },

  /* ── Map ── */
  mapScroll: { flex: 1 },
  mapContent: {
    paddingTop: 28,
    alignItems: 'center',
    minHeight: '100%',
  },



  /* Finish/Start */
  finishBanner: {
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 5,
    gap: 6,
    backgroundColor: '#080816',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  finishIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    letterSpacing: 0.8,
  },
  startMarker: {
    alignItems: 'center',
    marginTop: 16,
    zIndex: 5,
    gap: 6,
    backgroundColor: '#080816',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  startDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  startText: {
    fontSize: 10,
    fontFamily: 'Cairo_600SemiBold',
    color: '#4A4875',
    letterSpacing: 0.6,
  },

  /* Nodes */
  nodeRow: {
    width: '100%',
    alignItems: 'center',
    zIndex: 3,
    marginVertical: 6,
  },
  connectorDash: {
    width: 2,
    height: 44,
    borderRadius: 1,
    marginBottom: 6,
  },
  nodeLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 0,
  },
  nodeLayoutRight: { flexDirection: 'row-reverse' },
  nodeLayoutLeft:  { flexDirection: 'row' },

  /* Label */
  labelContainer: {
    flex: 1,
    gap: 2,
    paddingHorizontal: 8,
  },
  labelRight: { alignItems: 'flex-end' },
  labelLeft:  { alignItems: 'flex-start' },
  nowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginBottom: 3,
  },
  nowBadgeText: {
    fontSize: 9,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },
  nodeLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_700Bold',
    color: '#5C5B94',
  },
  nodeSub: {
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    color: '#3D3C6A',
    marginTop: 1,
  },

  /* Connector horizontal line */
  connectorH: {
    width: 20,
    height: 1.5,
    borderRadius: 1,
  },

  /* Node circles */
  nodeOrbitContainer: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nodeOrbit: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
  },
  nodeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    flexShrink: 0,
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: '#00BFA6',
    borderColor: '#00BFA6',
    shadowColor: '#00BFA6',
  },
  nodeLocked: {
    backgroundColor: '#131230',
    borderColor: '#2D2B52',
    shadowColor: 'transparent',
  },
  nodeEmoji: { fontSize: 22 },

  /* ── Drawer ── */
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#13122E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    borderTopWidth: 1,
    borderColor: '#1E1D47',
  },
  drawerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2D2B52',
    alignSelf: 'center',
    marginBottom: 14,
  },
  drawerClose: {
    position: 'absolute',
    top: 14,
    right: 20,
    padding: 4,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  drawerEmojiBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  drawerEmojiText: { fontSize: 24 },
  drawerHeaderText: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  drawerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  drawerBadgeText: {
    fontSize: 10,
    fontFamily: 'Cairo_700Bold',
  },
  drawerStageTitle: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: '#EEEEFF',
    textAlign: 'right',
  },

  /* Progress bar */
  drawerProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  drawerProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#1E1D47',
    borderRadius: 3,
    overflow: 'hidden',
  },
  drawerProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  drawerProgressPct: {
    fontSize: 12,
    fontFamily: 'Cairo_700Bold',
    minWidth: 38,
    textAlign: 'right',
  },

  /* Locked */
  drawerLockedBody: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  drawerLockIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLockText: {
    fontSize: 13,
    fontFamily: 'Cairo_600SemiBold',
    color: '#5C5B94',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  /* Celebration */
  celebrationBody: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  celebrationTitle: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: '#00BFA6',
    textAlign: 'center',
  },
  celebrationBtn: {
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 4,
  },
  celebrationBtnText: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },
  reviewLink: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  reviewLinkText: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    color: '#5C5B94',
    textDecorationLine: 'underline',
  },

  /* Tasks list in drawer */
  tasksForLabel: {
    fontSize: 10,
    fontFamily: 'Cairo_600SemiBold',
    color: '#5C5B94',
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: 'right',
  },
  taskRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: '#0E0E24',
    borderRadius: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  taskRowDone: { opacity: 0.45 },
  taskCheckWrap: {},
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#2D2B52',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080816',
  },
  taskText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Cairo_600SemiBold',
    color: '#EEEEFF',
    textAlign: 'right',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#3D3C6A',
  },

  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 10,
  },
  moreBtnText: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
  },

  /* CTA */
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 4,
  },
  ctaBtnText: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },

  /* Floating emojis */
  floatingEmoji: {
    position: 'absolute',
    fontSize: 26,
    zIndex: 9999,
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#13122E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 42 : 30,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: '#1E1D47',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2D2B52',
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#EEEEFF',
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
  modalProgressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#1E1D47',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressPct: {
    fontSize: 12,
    fontFamily: 'Cairo_700Bold',
    minWidth: 40,
    textAlign: 'right',
  },
  mTaskRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1E1D47',
  },
  mTaskRowDone: { opacity: 0.4 },
  mCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D2B52',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E24',
  },
  mTaskText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Cairo_400Regular',
    color: '#8B8CB0',
    textAlign: 'right',
  },
  mTaskTextDone: {
    textDecorationLine: 'line-through',
    color: '#3D3C6A',
  },
});
