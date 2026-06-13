import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';
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
import {
  LockIcon,
  CheckIcon,
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  TrophyIcon,
  ZapIcon,
  TargetIcon,
} from './common/CustomIcons';
import { SketchButton } from './common/SketchButton';
import { TornEdge } from './common/TornEdge';
import { AnimatedStrikethrough } from './common/AnimatedStrikethrough';
import { HighlighterBadge } from './common/HighlighterBadge';
import { GoalPin, Task } from '../types';
import { api } from '../services/api';
import { useAppSettings } from '../context/AppContext';
import { WashiTape } from './common/PinOrnaments';
import { Mascot } from './Mascot';

const { width, height } = Dimensions.get('window');
const SPINE_X = width / 2;

interface Props {
  goal: GoalPin;
  onBack: () => void;
  refreshGoals: () => Promise<void>;
}

type NodeStatus = 'completed' | 'active' | 'locked';


interface StageNodeRowProps {
  stage: any;
  displayIdx: number;
  realIdx: number;
  status: NodeStatus;
  labelOnRight: boolean;
  pinColor: string;
  colors: any;
  theme: 'light' | 'dark';
  isRTL: boolean;
  jt: any;
  pulseAnim: Animated.Value;
  onNodePress: (displayIdx: number) => void;
  onMeasureLayout: (realIdx: number, centerY: number, layout: { y: number; height: number }) => void;
  styles: any;
}

const StageNodeRow = React.memo(({
  stage,
  displayIdx,
  realIdx,
  status,
  labelOnRight,
  pinColor,
  colors,
  theme,
  isRTL,
  jt,
  pulseAnim,
  onNodePress,
  onMeasureLayout,
  styles,
}: StageNodeRowProps) => {
  return (
    <View
      style={styles.nodeRow}
      onLayout={(e) => {
        const { y, height } = e.nativeEvent.layout;
        const centerY = y + 44 + 34;
        onMeasureLayout(realIdx, centerY, { y, height });
      }}
    >
      {/* Spacer instead of dots to let the continuous winding path show through */}
      <View style={{ height: 44 }} />

      <TouchableOpacity
        onPress={() => onNodePress(displayIdx)}
        style={styles.nodeLayout}
        activeOpacity={0.8}
      >
        {/* Column 1: Left Side */}
        <View style={styles.nodeSideColumn}>
          {!labelOnRight && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
              <View style={[styles.labelContainer, { alignItems: 'flex-end' }]}>
                {status === 'active' && (
                  <View style={[styles.nowBadge, { backgroundColor: pinColor }]}>
                    <Text style={styles.nowBadgeText}>{jt.now}</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.nodeLabel,
                    status === 'completed' && { color: colors.accentAlt },
                    status === 'active'    && { color: colors.textPrimary, fontSize: 14 },
                    status === 'locked'    && { color: colors.textMuted },
                    { textAlign: 'right' }
                  ]}
                  numberOfLines={2}
                >
                  {stage.label}
                </Text>
                <Text style={[styles.nodeSub, { textAlign: 'right' }]}>{stage.sublabel}</Text>
              </View>
              <View style={[styles.connectorH, { backgroundColor: colors.border }]} />
            </View>
          )}
        </View>

        {/* Column 2: Center Node */}
        <View style={styles.nodeCenterColumn}>
          <View style={styles.nodeOrbitContainer}>
            {status === 'active' ? (
              <>
                <Animated.View style={[
                  styles.nodeOrbit,
                  { borderColor: pinColor + '55', transform: [{ scale: pulseAnim }] }
                ]} />
                <View style={[styles.nodeCircle, { backgroundColor: pinColor, borderColor: colors.border, shadowColor: colors.border }]}>
                  <Text style={styles.nodeEmoji}>{stage.emoji}</Text>
                </View>
              </>
            ) : status === 'completed' ? (
              <View style={[styles.nodeCircle, styles.nodeCompleted]}>
                <CheckIcon size={20} color="#FFFFFF" />
              </View>
            ) : (
              <View style={[styles.nodeCircle, styles.nodeLocked]}>
                <LockIcon size={16} color={colors.textMuted} />
              </View>
            )}
          </View>
        </View>

        {/* Column 3: Right Side */}
        <View style={styles.nodeSideColumn}>
          {labelOnRight && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
              <View style={[styles.connectorH, { backgroundColor: colors.border }]} />
              <View style={[styles.labelContainer, { alignItems: 'flex-start' }]}>
                {status === 'active' && (
                  <View style={[styles.nowBadge, { backgroundColor: pinColor }]}>
                    <Text style={styles.nowBadgeText}>{jt.now}</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.nodeLabel,
                    status === 'completed' && { color: colors.accentAlt },
                    status === 'active'    && { color: colors.textPrimary, fontSize: 14 },
                    status === 'locked'    && { color: colors.textMuted },
                    { textAlign: 'left' }
                  ]}
                  numberOfLines={2}
                >
                  {stage.label}
                </Text>
                <Text style={[styles.nodeSub, { textAlign: 'left' }]}>{stage.sublabel}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});
StageNodeRow.displayName = 'StageNodeRow';

interface JourneyDrawerTaskRowProps {
  task: Task;
  pinColor: string;
  colors: any;
  onPress: (taskId: string, currentlyCompleted: boolean) => void;
  styles: any;
}

const JourneyDrawerTaskRow = React.memo(({
  task,
  pinColor,
  colors,
  onPress,
  styles,
}: JourneyDrawerTaskRowProps) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.35, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.0, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [task.completed]);

  return (
    <TouchableOpacity
      onPress={() => onPress(task.id, task.completed)}
      style={[
        styles.taskRow,
        task.completed && styles.taskRowDone,
        { borderLeftColor: pinColor },
      ]}
      activeOpacity={0.75}
    >
      <Animated.View style={[styles.taskCheckWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[
          styles.taskCheck,
          task.completed && { backgroundColor: pinColor, borderColor: colors.border },
        ]}>
          {task.completed && <CheckIcon size={10} color="#FFF" />}
        </View>
      </Animated.View>
      <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
        <Text style={[styles.taskText, task.completed && { color: colors.textMuted }]}>
          {task.text}
        </Text>
        <AnimatedStrikethrough visible={task.completed} />
      </View>
    </TouchableOpacity>
  );
});
JourneyDrawerTaskRow.displayName = 'JourneyDrawerTaskRow';

interface JourneyModalTaskRowProps {
  task: Task;
  idx: number;
  pinColor: string;
  colors: any;
  onPress: (taskId: string, completed: boolean, idx: number) => void;
  styles: any;
}

const JourneyModalTaskRow = React.memo(({
  task,
  idx,
  pinColor,
  colors,
  onPress,
  styles,
}: JourneyModalTaskRowProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(task.id, task.completed, idx)}
      style={[styles.mTaskRow, task.completed && styles.mTaskRowDone]}
      activeOpacity={0.75}
    >
      <View style={[
        styles.mCheckbox,
        task.completed && { backgroundColor: pinColor, borderColor: colors.border },
      ]}>
        {task.completed && <CheckIcon size={10} color="#FFF" />}
      </View>
      <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
        <Text style={[styles.mTaskText, task.completed && { color: colors.textMuted }]}>
          {task.text}
        </Text>
        <AnimatedStrikethrough visible={task.completed} />
      </View>
    </TouchableOpacity>
  );
});
JourneyModalTaskRow.displayName = 'JourneyModalTaskRow';

export function JourneyMapScreen({ goal, onBack, refreshGoals }: Props) {
  const { colors, theme, language } = useAppSettings();
  const styles = React.useMemo(() => makeStyles(colors, theme), [colors, theme]);
  const isRTL = language === 'ar';

  const jt = useMemo(() => ({
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
  }), [isRTL]);

  const [tasks, setTasks] = useState<Task[]>(goal.tasks);
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasScrolledRef = useRef(false);
  const nodeLayoutsRef = useRef<{ [key: number]: { y: number; height: number } }>({});

  // Animations
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationScale = useRef(new Animated.Value(0.5)).current;
  const [nodeCoords, setNodeCoords] = useState<{ [key: number]: { x: number; y: number } }>({});



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

  useEffect(() => {
    if (showCelebration) {
      celebrationScale.setValue(0.5);
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [showCelebration]);

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

  const stageStatuses = useMemo(() => {
    const statuses: NodeStatus[] = [];
    let prevCompleted = true;
    for (let i = 0; i < numStages; i++) {
      const base = Math.floor(N / numStages);
      const extra = N % numStages;
      let startIdx = 0;
      for (let j = 0; j < i; j++) {
        startIdx += base + (j < extra ? 1 : 0);
      }
      const count = base + (i < extra ? 1 : 0);
      const stageTasks = tasks.slice(startIdx, startIdx + count);
      
      const allDone = stageTasks.length > 0 && stageTasks.every((t) => t.completed);
      if (i === 0) {
        statuses.push(allDone ? 'completed' : 'active');
      } else {
        if (!prevCompleted) {
          statuses.push('locked');
        } else {
          statuses.push(allDone ? 'completed' : 'active');
        }
      }
      prevCompleted = (statuses[i] === 'completed');
    }
    return statuses;
  }, [tasks, N, numStages]);

  const getStatus = useCallback((stageIdx: number): NodeStatus => {
    if (stageIdx < 0 || stageIdx >= stageStatuses.length) return 'locked';
    return stageStatuses[stageIdx];
  }, [stageStatuses]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = N > 0 ? Math.round((completedCount / N) * 100) : 0;

  // Displayed: top = most advanced (reverse)
  const displayedStages = [...goal.stages].reverse();
  const toRealIdx = (displayIdx: number) => goal.stages.length - 1 - displayIdx;

  const handleNodePress = useCallback((displayIdx: number) => {
    const realIdx = goal.stages.length - 1 - displayIdx;
    setSelectedStageIdx(realIdx);
    setShowCompletedTasks(false);
    setDrawerVisible(true);
  }, [goal.stages.length]);

  const handleMeasureLayout = useCallback((realIdx: number, centerY: number, layout: { y: number; height: number }) => {
    nodeLayoutsRef.current[realIdx] = layout;
    setNodeCoords((prev) => {
      if (prev[realIdx]?.y === centerY) return prev;
      return { ...prev, [realIdx]: { x: width / 2, y: centerY } };
    });
  }, []);

  const pathD = useMemo(() => {
    const coordsList = Object.keys(nodeCoords)
      .map(Number)
      .sort((a, b) => b - a) // from first stage (bottom) to last stage (top)
      .map(idx => nodeCoords[idx]);

    if (coordsList.length === 0) return '';

    // Start coordinates (at the bottom, let's say ~100px below the first stage)
    const startY = coordsList[0].y + 100;
    let d = `M ${width / 2} ${startY}`;

    // Winding control points
    for (let i = 0; i < coordsList.length; i++) {
      const curr = coordsList[i];
      const prevY = i === 0 ? startY : coordsList[i - 1].y;
      const midY = (prevY + curr.y) / 2;
      // Alternate curves left and right
      const isLeft = i % 2 === 0;
      const offset = isLeft ? -45 : 45;
      
      d += ` Q ${width / 2 + offset} ${midY} ${width / 2} ${curr.y}`;
    }

    // Finish coordinates (at the top, above the last stage)
    const lastNode = coordsList[coordsList.length - 1];
    const finishY = lastNode.y - 100;
    const isLeft = coordsList.length % 2 === 0;
    const offset = isLeft ? -45 : 45;
    d += ` Q ${width / 2 + offset} ${(lastNode.y + finishY) / 2} ${width / 2} ${finishY}`;

    return d;
  }, [nodeCoords]);



  const toggleTask = React.useCallback(async (taskId: string, currentlyCompleted: boolean) => {
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed: !currentlyCompleted } : t));
    setTasks(updatedTasks);

    if (selectedStageIdx !== null) {
      const base = Math.floor(N / numStages);
      const extra = N % numStages;
      let startIdx = 0;
      for (let i = 0; i < selectedStageIdx; i++) {
        startIdx += base + (i < extra ? 1 : 0);
      }
      const count = base + (selectedStageIdx < extra ? 1 : 0);
      const stageTasks = updatedTasks.slice(startIdx, startIdx + count);
      
      const allDone = stageTasks.length > 0 && stageTasks.every((t) => t.completed);
      if (allDone) {
        setTimeout(() => {
          setDrawerVisible(false);
          setModalVisible(false);
          setTimeout(() => {
            setShowCelebration(true);
          }, 350);
        }, 750);
      }
    }

    try {
      await api.toggleTask(taskId, !currentlyCompleted);
      await refreshGoals();
    } catch {
      Alert.alert(jt.alertErr, jt.alertErrMsg);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: currentlyCompleted } : t))
      );
    }
  }, [tasks, selectedStageIdx, N, numStages, refreshGoals, jt.alertErr, jt.alertErrMsg]);

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
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          {isRTL ? (
            <ArrowRightIcon size={18} color={colors.textPrimary} />
          ) : (
            <ArrowLeftIcon size={18} color={colors.textPrimary} />
          )}
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
      <View style={[styles.goalCard, { borderColor: colors.border }]}>
        {/* Left: text */}
        <View style={styles.goalCardLeft}>
          <Text style={styles.goalCardTitle} numberOfLines={2}>{goal.text}</Text>
          <Text style={styles.goalCardSub}>
            {completedCount}/{N} {jt.tasks} {jt.completed}
          </Text>
          <View style={styles.goalCardStreak}>
            <ZapIcon size={11} color={goal.pinColor} />
            <Text style={[styles.goalCardStreakText, { color: goal.pinColor }]}>
              {isRTL ? `5 ${jt.streakDays}` : `5 ${jt.streakDays}`}
            </Text>
          </View>
        </View>

        {/* Right: circular progress ring */}
        <View style={styles.goalCardRight}>
          <View style={[styles.progressRingOuter, { borderColor: colors.border }]}>
            <View style={[styles.progressRingInner, { borderColor: goal.pinColor }]}>
              <Text style={[styles.progressRingNum, { color: colors.textPrimary }]}>{progressPercent}%</Text>
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
        {/* Absolute Background Decorations to make the map feel alive & adventure-themed */}
        <Text style={[styles.bgDecoration, { top: height * 0.15, left: 30, transform: [{ rotate: '-12deg' }] }]}>🧭</Text>
        <Text style={[styles.bgDecoration, { top: height * 0.38, right: 35, transform: [{ rotate: '15deg' }] }]}>🎈</Text>
        <Text style={[styles.bgDecoration, { top: height * 0.62, left: 40, transform: [{ rotate: '-8deg' }] }]}>🌲</Text>
        <Text style={[styles.bgDecoration, { top: height * 0.78, right: 45, transform: [{ rotate: '10deg' }] }]}>⛰️</Text>
        <Text style={[styles.bgDecoration, { bottom: 80, left: 25, transform: [{ rotate: '5deg' }] }]}>🏕️</Text>

        {/* Sketchy winding timeline path */}
        {pathD !== '' && (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none" renderToHardwareTextureAndroid={true}>
            <Svg style={StyleSheet.absoluteFillObject}>
              {/* Draw a subtle thick hand-drawn highlight behind */}
              <Path
                d={pathD}
                fill="none"
                stroke={goal.pinColor + '1C'}
                strokeWidth={14}
                strokeLinecap="round"
              />
              {/* Main dashed path */}
              <Path
                d={pathD}
                fill="none"
                stroke={colors.border}
                strokeWidth={3}
                strokeDasharray="6, 6"
                strokeLinecap="round"
                opacity={0.8}
              />
            </Svg>
          </View>
        )}

        {/* Finish banner */}
        <View style={styles.finishBanner}>
          <View style={[styles.finishIcon, { backgroundColor: goal.pinColor + '22' }]}>
            <TrophyIcon size={18} color={goal.pinColor} />
          </View>
          <Text style={[styles.finishText, { color: goal.pinColor }]}>{jt.finish}</Text>
        </View>

        {/* Nodes */}
        {displayedStages.map((stage, displayIdx) => {
          const realIdx = toRealIdx(displayIdx);
          const status = getStatus(realIdx);
          const labelOnRight = isRTL ? (displayIdx % 2 !== 0) : (displayIdx % 2 === 0);

          return (
            <StageNodeRow
              key={stage.id}
              stage={stage}
              displayIdx={displayIdx}
              realIdx={realIdx}
              status={status}
              labelOnRight={labelOnRight}
              pinColor={goal.pinColor}
              colors={colors}
              theme={theme}
              isRTL={isRTL}
              jt={jt}
              pulseAnim={pulseAnim}
              onNodePress={handleNodePress}
              onMeasureLayout={handleMeasureLayout}
              styles={styles}
            />
          );
        })}

        {/* Bottom spacer from last node to start marker */}
        <View style={{ height: 44 }} />

        {/* Start marker */}
        <View style={styles.startMarker}>
          <View style={[styles.startDot, { borderColor: colors.border, backgroundColor: goal.pinColor + '22' }]} />
          <Text style={styles.startText}>{jt.start}</Text>
        </View>
      </ScrollView>



      {/* ── Bottom Drawer ── */}
      {drawerVisible && drawerStage && (
        <Animated.View style={[styles.drawer, { transform: [{ translateY: drawerTranslateY }] }]}>
          {/* Unified realistic torn paper edge */}
          <TornEdge
            color={colors.surfaceElevated}
            borderColor={colors.border}
            style={{ position: 'absolute', top: -21, left: -12 }}
          />

          {/* Handle */}
          <View style={styles.drawerHandle} />

          {/* Close */}
          <TouchableOpacity style={styles.drawerClose} onPress={() => setDrawerVisible(false)} activeOpacity={0.7}>
            <XIcon size={14} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Stage header */}
          <View style={styles.drawerHeader}>
            <View style={[styles.drawerEmojiBox, { backgroundColor: goal.pinColor + '22' }]}>
              <Text style={styles.drawerEmojiText}>{drawerStage.emoji}</Text>
            </View>
            <View style={styles.drawerHeaderText}>
              <HighlighterBadge
                text={
                  drawerStatus === 'completed' ? jt.badgeDone
                   : drawerStatus === 'active'  ? jt.badgeActive
                   : jt.badgeLocked
                }
                textColor={
                  drawerStatus === 'completed' ? colors.accentAlt
                   : drawerStatus === 'active'  ? goal.pinColor
                   : '#EF4444'
                }
                highlightColor={
                  drawerStatus === 'completed' ? colors.accentAlt + '20'
                   : drawerStatus === 'active'  ? goal.pinColor + '22'
                   : '#EF444420'
                }
              />
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

          {/* Locked or Active/Completed checklist */}
          {drawerStatus === 'locked' ? (
            <View style={styles.drawerLockedBody}>
              <View style={[styles.drawerLockIcon, { backgroundColor: goal.pinColor + '15' }]}>
                <LockIcon size={26} color={goal.pinColor} />
              </View>
              <Text style={styles.drawerLockText}>{jt.lockMsg}</Text>
            </View>
          ) : (
            /* Active or Completed Task list */
            <View>
              <Text style={styles.tasksForLabel}>{jt.tasksFor}</Text>
              {drawerTasks.slice(0, 3).map((task) => (
                <JourneyDrawerTaskRow
                  key={task.id}
                  task={task}
                  pinColor={goal.pinColor}
                  colors={colors}
                  onPress={toggleTask}
                  styles={styles}
                />
              ))}

              {drawerTasks.length > 3 && (
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.moreBtn}>
                  <Text style={[styles.moreBtnText, { color: goal.pinColor }]}>
                    {jt.moreTasks(drawerTasks.length - 3)}
                  </Text>
                  <ChevronRightIcon size={12} color={goal.pinColor} />
                </TouchableOpacity>
              )}

              {/* CTA or Claim Trophy Button */}
              {drawerStatus === 'completed' ? (
                <View style={{ marginTop: 14 }}>
                  <SketchButton
                    onPress={() => setShowCelebration(true)}
                    variant="accentAlt"
                    title={isRTL ? '🏆 عرض الكأس 🎉' : '🏆 View Stage Trophy 🎉'}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={[styles.ctaBtn, { backgroundColor: goal.pinColor }]}
                  activeOpacity={0.8}
                >
                  <TargetIcon size={16} color="#FFF" />
                  <Text style={styles.ctaBtnText}>{jt.viewAll}</Text>
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
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn} activeOpacity={0.7}>
                <XIcon size={14} color={colors.textPrimary} />
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
                <JourneyModalTaskRow
                  key={task.id}
                  task={task}
                  idx={idx}
                  pinColor={goal.pinColor}
                  colors={colors}
                  onPress={toggleTask}
                  styles={styles}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Milestone Achievement Modal ── */}
      <Modal
        visible={showCelebration}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCelebration(false)}
      >
        <View style={styles.celebrationOverlay}>
          <Animated.View style={[styles.celebrationCard, { transform: [{ scale: celebrationScale }] }]}>
            <WashiTape style={{ top: -10, backgroundColor: 'rgba(255, 107, 107, 0.4)' }} />
            
            <View style={styles.celebrationBadgeWrap}>
              <Text style={{ fontSize: 72 }}>{drawerStage?.emoji || '🏆'}</Text>
              <View style={styles.celebrationSparkles}>
                <Text style={{ fontSize: 28, position: 'absolute', top: -10, left: -20 }}>✨</Text>
                <Text style={{ fontSize: 24, position: 'absolute', bottom: -10, right: -20 }}>⭐</Text>
                <Text style={{ fontSize: 26, position: 'absolute', top: 30, right: -30 }}>✨</Text>
              </View>
            </View>

            <Text style={styles.celebrationHeader}>{isRTL ? 'إنجاز جديد! 🎉' : 'Milestone Unlocked! 🎉'}</Text>
            <Text style={styles.celebrationSubtitle}>
              {isRTL ? 'لقد أكملت بنجاح مرحلة:' : 'You have successfully completed the stage:'}
            </Text>
            <View style={styles.celebrationStageBox}>
              <Text style={styles.celebrationStageLabel}>{drawerStage?.label}</Text>
            </View>

            <View style={styles.celebrationMascotRow}>
              <Mascot size={90} variant="ready" />
              <View style={styles.celebrationSpeech}>
                <Text style={[styles.celebrationSpeechText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL 
                    ? 'عمل مذهل! خطوة أخرى تقربك من تحقيق هدفك بالكامل. فخور بك! 🌟' 
                    : 'Amazing work! One step closer to fully achieving your goal. So proud of you! 🌟'}
                </Text>
              </View>
            </View>

            <View style={{ width: '100%', marginTop: 24 }}>
              {selectedStageIdx !== null && selectedStageIdx < goal.stages.length - 1 ? (
                <SketchButton
                  onPress={() => {
                    setShowCelebration(false);
                    setDrawerVisible(false);
                    setShowCompletedTasks(false);
                    const nextIdx = selectedStageIdx + 1;
                    setSelectedStageIdx(nextIdx);
                    
                    setTimeout(() => {
                      const nextLayout = nodeLayoutsRef.current[nextIdx];
                      if (nextLayout && scrollViewRef.current) {
                        const viewportHeight = height - 200;
                        const scrollY = nextLayout.y - (viewportHeight / 2) + (nextLayout.height / 2);
                        scrollViewRef.current.scrollTo({ y: Math.max(0, scrollY), animated: true });
                      }
                    }, 100);
                  }}
                  title={jt.proceedNext}
                  variant="primary"
                />
              ) : (
                <SketchButton
                  onPress={() => setShowCelebration(false)}
                  title={jt.goalDone}
                  variant="accentAlt"
                />
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  header: {
    height: Platform.OS === 'ios' ? 90 : 64,
    paddingTop: Platform.OS === 'ios' ? 44 : 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    gap: 2,
  },
  headerSub: {
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
  },
  headerPct: {
    alignItems: 'center',
  },
  headerPctNum: {
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
  },

  goalCard: {
    marginHorizontal: 18,
    marginBottom: 8,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 2.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    shadowColor: colors.border,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  goalCardLeft: {
    flex: 1,
    gap: 4,
  },
  goalCardTitle: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  goalCardSub: {
    fontSize: 11,
    fontFamily: 'Cairo_400Regular',
    color: colors.textMuted,
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
    color: colors.textPrimary,
  },
  goalCardRight: {
    marginLeft: 16,
  },
  progressRingOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingNum: {
    fontSize: 13,
    fontFamily: 'Cairo_700Bold',
  },

  mapScroll: { flex: 1 },
  mapContent: {
    paddingTop: 28,
    alignItems: 'center',
    minHeight: '100%',
  },

  finishBanner: {
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 5,
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  finishIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  finishText: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    letterSpacing: 0.8,
    color: colors.textPrimary,
  },
  startMarker: {
    alignItems: 'center',
    marginTop: 16,
    zIndex: 5,
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  startDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  startText: {
    fontSize: 10,
    fontFamily: 'Cairo_600SemiBold',
    color: colors.textMuted,
    letterSpacing: 0.6,
  },

  nodeRow: {
    width: '100%',
    alignItems: 'center',
    zIndex: 3,
    marginVertical: 6,
  },
  connectorDash: {
    width: 2.5,
    height: 44,
    borderRadius: 1.25,
    marginBottom: 6,
  },
  nodeLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 0,
  },
  nodeSideColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  nodeCenterColumn: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelContainer: {
    flex: 1,
    gap: 2,
    paddingHorizontal: 8,
  },
  nowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 3,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  nowBadgeText: {
    fontSize: 9,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },
  nodeLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
  },
  nodeSub: {
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    color: colors.textSecondary,
    marginTop: 1,
  },

  connectorH: {
    width: 20,
    height: 2.5,
    borderRadius: 1.25,
  },

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
    borderWidth: 2.5,
  },
  nodeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    flexShrink: 0,
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: colors.accentAlt,
    borderColor: colors.border,
    shadowColor: colors.border,
  },
  nodeLocked: {
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    shadowColor: 'transparent',
  },
  nodeEmoji: { fontSize: 22 },

  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.border,
  },
  drawerHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  drawerClose: {
    position: 'absolute',
    top: 14,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.border,
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
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
    borderWidth: 2,
    borderColor: colors.border,
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
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  drawerBadgeText: {
    fontSize: 10,
    fontFamily: 'Cairo_700Bold',
  },
  drawerStageTitle: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
    textAlign: 'right',
  },

  drawerProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  drawerProgressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.bgSecondary,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
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
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  drawerLockText: {
    fontSize: 13,
    fontFamily: 'Cairo_600SemiBold',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  celebrationBody: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    alignSelf: 'stretch',
  },
  celebrationTitle: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: colors.accentAlt,
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
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },

  tasksForLabel: {
    fontSize: 10,
    fontFamily: 'Cairo_600SemiBold',
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderLeftWidth: 5,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  taskRowDone: {
    opacity: 0.6,
    backgroundColor: colors.bgSecondary,
  },
  taskCheckWrap: {},
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  taskText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Cairo_600SemiBold',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  taskTextDone: {
    color: colors.textMuted,
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

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginTop: 4,
  },
  ctaBtnText: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },



  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 42 : 30,
    maxHeight: '80%',
    borderWidth: 2.5,
    borderBottomWidth: 0,
    borderColor: colors.border,
  },
  modalHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.border,
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
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.border,
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
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
    height: 10,
    backgroundColor: colors.bgSecondary,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 3,
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
    borderBottomWidth: 2,
    borderColor: colors.borderLight,
  },
  mTaskRowDone: { opacity: 0.6 },
  mCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  mTaskText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Cairo_400Regular',
    color: colors.textSecondary,
    textAlign: 'right',
  },
  mTaskTextDone: {
    color: colors.textMuted,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationCard: {
    width: width * 0.88,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
    shadowColor: colors.border,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    position: 'relative',
  },
  celebrationBadgeWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.bgSecondary,
    borderWidth: 2.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  celebrationSparkles: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  celebrationHeader: {
    fontSize: 20,
    fontFamily: 'Cairo_700Bold',
    color: colors.accentAlt,
    marginTop: 18,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  celebrationStageBox: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 14,
    alignSelf: 'center',
  },
  celebrationStageLabel: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  celebrationMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    paddingHorizontal: 6,
  },
  celebrationSpeech: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  celebrationSpeechText: {
    fontSize: 11,
    fontFamily: 'Cairo_700Bold',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  bgDecoration: {
    position: 'absolute',
    fontSize: 28,
    opacity: theme === 'light' ? 0.35 : 0.18,
    zIndex: 0,
  },
  connectorContainer: {
    height: 44,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 4,
  },
  connectorPoint: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
