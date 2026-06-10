import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { ArrowRight, Mic, Send, Sparkles } from 'lucide-react-native';
import { ActiveTab, Message } from '../types';
import { api } from '../services/api';
import { useAppSettings } from '../context/AppContext';

const { width } = Dimensions.get('window');

interface Props {
  onNavigate: (s: ActiveTab) => void;
  refreshGoal: () => Promise<void>;
}

export function ChatScreen({ onNavigate, refreshGoal }: Props) {
  const { colors, t, language } = useAppSettings();
  const isRTL = language === 'ar';
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const welcomeMsg = isRTL
    ? 'أهلاً بك! أنا انار، مرشدك الذكي. كيف يمكنني مساعدتك اليوم في رحلتك التعليمية أو المهنية؟'
    : 'Welcome! I am Anar, your AI guide. How can I help you today on your learning or career journey?';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      text: welcomeMsg,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [creating, setCreating] = useState(false);
  const [suggestedGoal, setSuggestedGoal] = useState<string | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoalText, setEditedGoalText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  // Pulsing glow on avatar
  const avatarGlow = useRef(new Animated.Value(0.6)).current;
  // Typing dot animations
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarGlow, { toValue: 1,   duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(avatarGlow, { toValue: 0.5, duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    const animateDots = () => {
      const makeDot = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
            Animated.delay(600),
          ])
        );
      makeDot(dot1, 0).start();
      makeDot(dot2, 150).start();
      makeDot(dot3, 300).start();
    };
    animateDots();
    return () => { dot1.stopAnimation(); dot2.stopAnimation(); dot3.stopAnimation(); };
  }, [isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const messageText = textToSend || inputVal;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      let aiText = '';
      let goalText = '';
      const text = messageText.toLowerCase();

      if (text.includes('برمج') || text.includes('كود') || text.includes('بايثون') || text.includes('برنامج') || text.includes('مهارة') || text.includes('web') || text.includes('code') || text.includes('تطوير')) {
        aiText = 'خطوة ممتازة! البرمجة وتطوير المهارات التقنية هي استثمار رائع للمستقبل. لا تقلق بشأن البداية، سنرسم خريطة طريق واضحة معاً. لقد صممت لك هذا الهدف المقترح:';
        goalText = 'تعلم أساسيات البرمجة (بايثون) في 30 يوماً';
      } else if (text.includes('رياض') || text.includes('وزن') || text.includes('صحة') || text.includes('جسم') || text.includes('نادي') || text.includes('فتنس') || text.includes('تمرين')) {
        aiText = 'رائع جداً! العقل السليم في الجسم السليم. ممارسة الرياضة ستحسن من طاقتك وصحتك النفسية والجسدية بشكل مذهل. إليك هذا الهدف المقترح للبدء فوراً:';
        goalText = 'ممارسة الرياضة المنزلية 4 مرات أسبوعياً وإنقاص الوزن';
      } else if (text.includes('قراء') || text.includes('كتاب') || text.includes('رواية') || text.includes('ثقافة') || text.includes('علم')) {
        aiText = 'يا لها من خطوة قيمة! القراءة هي أفضل وسيلة لتوسيع المدارك وتطوير التفكير المنطقي وزيادة المعرفة. لقد قمت بصياغة هذا الهدف البصري لك:';
        goalText = 'قراءة كتابين وتلخيص أهم الأفكار منهما هذا الشهر';
      } else if (text.includes('درس') || text.includes('دراست') || text.includes('أكاديم') || text.includes('مذاكر') || text.includes('امتحان') || text.includes('مدرسة') || text.includes('جامعة')) {
        aiText = 'الدراسة والتحصيل العلمي هما أساس المستقبل والارتقاء الفكري. سنقسم موادك الدراسية ونضع خطة مراجعة مريحة وفعالة. إليك هدفك الدراسي المقترح:';
        goalText = 'المذاكرة اليومية المركزة لمدة ساعتين والمراجعة الأسبوعية';
      } else if (text.includes('نوم') || text.includes('وقت') || text.includes('تنظيم') || text.includes('يوم') || text.includes('جدول') || text.includes('ترتيب') || text.includes('إدارة')) {
        aiText = 'تنظيم الوقت وإدارة المهام اليومية هو سر النجاح والانضباط. ترتيب يومك سيقلل من التوتر ويزيد من إنتاجيتك بشكل ملحوظ. إليك هذا الهدف المقترح لتنظيم وقتك:';
        goalText = 'تنظيم النوم والاستيقاظ مبكراً الساعة 6 صباحاً يومياً';
      } else if (text.includes('لغة') || text.includes('إنجليز') || text.includes('english') || text.includes('تحدث')) {
        aiText = 'تعلم لغة جديدة يفتح لك آفاقاً واسعة للدراسة والعمل والسفر. الممارسة اليومية والاستماع هما مفتاح النجاح. إليك هدفك الجديد المقترح:';
        goalText = 'تعلم وممارسة اللغة الإنجليزية لمدة 20 دقيقة يومياً';
      } else {
        const summary = messageText.length > 25 ? messageText.substring(0, 25) + '...' : messageText;
        aiText = `رائع! السعي نحو "${summary}" هو بداية التغيير الحقيقي للأفضل. سنعمل معاً خطوة بخطوة للوصول إلى غايتك. لقد صممت هذا الهدف بناءً على طلبك:`;
        goalText = messageText.trim();
      }

      const aiReply: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
      setSuggestedGoal(goalText);
    }, 1500);
  };

  const handleChipSelect = (chipText: string) => {
    let text = '';
    if (chipText === 'دراستي') {
      text = 'أريد أن أدرس وأحسّن مستواي الأكاديمي';
    } else if (chipText === 'تطوير مهارة') {
      text = 'أريد أن أتعلم البرمجة، لكني لا أعرف من أين أبدأ وأشعر بالضياع قليلاً.';
    } else {
      text = 'أريد تنظيم وقتي وإدارة مهامي اليومية بشكل أفضل';
    }
    handleSendMessage(text);
  };

  const handleAcceptGoal = async () => {
    if (!suggestedGoal) return;
    setCreating(true);
    try {
      await api.createGoal(suggestedGoal);
      await refreshGoal();

      const successMsg: Message = {
        id: Date.now() + 2,
        role: 'ai',
        text: `تم تثبيت هدفك "${suggestedGoal}" على لوحة الرؤية 📌 وتم إنشاء خريطة رحلة مخصصة لك! اضغط على البطاقة في اللوحة لعرض مساركك.`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, successMsg]);
      setSuggestedGoal(null);

      setTimeout(() => onNavigate('vision'), 1400);
    } catch (err) {
      Alert.alert('خطأ', 'فشل اعتماد الهدف، يرجى المحاولة مرة أخرى.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditGoal = () => {
    setEditedGoalText(suggestedGoal || '');
    setIsEditingGoal(true);
  };

  return (
    <View style={styles.container}>
      {/* ── Background ── */}
      <View style={styles.bgBase} />
      <View style={styles.bgBlue1} />
      <View style={styles.bgBlue2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <ArrowRight size={20} color="#A0AEC0" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{t.chat_title}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t.chat_online}</Text>
            </View>
          </View>

          {/* AI Avatar with glow */}
          <View style={styles.avatarWrap}>
            <Animated.View style={[styles.avatarGlow, { opacity: avatarGlow }]} />
            <View style={styles.avatarCircle}>
              <View style={styles.robotFace}>
                <View style={styles.robotEyes} />
              </View>
            </View>
          </View>
        </View>

        {/* ── Message stream ── */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.streamContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.msgWrapper,
                msg.role === 'user' && styles.msgWrapperUser,
              ]}
            >
              {/* AI avatar dot */}
              {msg.role === 'ai' && (
                <View style={styles.bubbleAvatar}>
                  <View style={styles.miniRobotFace}>
                    <View style={styles.miniRobotEyes} />
                  </View>
                </View>
              )}

              {/* Bubble */}
              <View style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                <Text style={[
                  styles.bubbleText,
                  { textAlign: isRTL ? 'right' : 'left' },
                  msg.role === 'user' && styles.userBubbleText,
                ]}>
                  {msg.text}
                </Text>

                {/* Quick-reply chips on first message */}
                {msg.id === 1 && (
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      onPress={() => handleChipSelect(isRTL ? 'تنظيم الوقت' : 'time')}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{t.chip_time}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleChipSelect(isRTL ? 'تطوير مهارة' : 'skill')}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{t.chip_skill}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleChipSelect(isRTL ? 'دراستي' : 'study')}
                      style={styles.chip}
                    >
                      <Text style={styles.chipText}>{t.chip_study}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* ── Suggested Goal Card ── */}
          {suggestedGoal && (
            <View style={styles.msgWrapper}>
              <View style={styles.bubbleAvatar}>
                <View style={styles.miniRobotFace}>
                  <View style={styles.miniRobotEyes} />
                </View>
              </View>
              <View style={styles.goalCard}>
                {/* Card header */}
                <View style={styles.goalCardHeader}>
                  <Sparkles size={13} color="#A78BFA" />
                  <Text style={styles.goalCardHeaderText}>{t.chat_goal_proposed}</Text>
                </View>

                {/* Goal text */}
                <View style={styles.goalContent}>
                  {isEditingGoal ? (
                    <TextInput
                      style={styles.goalInput}
                      value={editedGoalText}
                      onChangeText={setEditedGoalText}
                      textAlign="center"
                      autoFocus
                      placeholderTextColor="#4A4875"
                    />
                  ) : (
                    <Text style={styles.goalText}>{suggestedGoal}</Text>
                  )}
                </View>

                <Text style={styles.goalPrompt}>
                  {isEditingGoal
                    ? 'عدل نص الهدف المكتوب أعلاه ثم احفظه'
                    : 'سيتم تثبيته كبطاقة في لوحة الرؤية وإنشاء خريطة رحلة مخصصة لك 📌'}
                </Text>

                {/* Action buttons */}
                <View style={styles.goalBtnsRow}>
                  {isEditingGoal ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setIsEditingGoal(false)}
                        style={styles.goalBtnSecondary}
                      >
                        <Text style={styles.goalBtnSecondaryText}>{t.chat_cancel}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          if (editedGoalText.trim()) setSuggestedGoal(editedGoalText);
                          setIsEditingGoal(false);
                        }}
                        style={styles.goalBtnPrimary}
                      >
                        <Text style={styles.goalBtnPrimaryText}>{t.chat_save}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={handleEditGoal} style={styles.goalBtnSecondary}>
                        <Text style={styles.goalBtnSecondaryText}>{t.chat_edit_goal}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleAcceptGoal}
                        disabled={creating}
                        style={styles.goalBtnPrimary}
                      >
                        {creating
                          ? <ActivityIndicator color="#050B18" size="small" />
                          : <Text style={styles.goalBtnPrimaryText}>نعم، اعتمد الهدف</Text>
                        }
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* ── Typing indicator ── */}
          {isTyping && (
            <View style={styles.msgWrapper}>
              <View style={styles.bubbleAvatar}>
                <View style={styles.miniRobotFace}>
                  <View style={styles.miniRobotEyes} />
                </View>
              </View>
              <View style={[styles.aiBubble, { paddingVertical: 14, paddingHorizontal: 18 }]}>
                <View style={styles.typingRow}>
                  <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
                  <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
                  <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Input area ── */}
        <View style={styles.inputArea}>
          {/* Send button */}
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            style={[styles.sendBtn, !inputVal.trim() && styles.sendBtnDisabled]}
            activeOpacity={0.85}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Text input */}
          <View style={styles.inputWrap}>
            <TextInput
              placeholder={t.chat_placeholder}
              placeholderTextColor="#3D5066"
              value={inputVal}
              onChangeText={setInputVal}
              style={styles.input}
              textAlign={isRTL ? 'right' : 'left'}
              onSubmitEditing={() => handleSendMessage()}
              multiline={false}
            />
            <TouchableOpacity
              onPress={() => Alert.alert(isRTL ? 'التسجيل الصوتي' : 'Voice Input', isRTL ? 'ميزة الإدخال الصوتي ستتوفر قريباً' : 'Voice input coming soon')}
              style={styles.micBtn}
            >
              <Mic size={18} color="#3D5066" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },

    /* ── Background ── */
    bgBase: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: colors.bg,
    },
    bgBlue1: {
      position: 'absolute',
      top: -60, left: -60,
      width: 260, height: 260, borderRadius: 130,
      backgroundColor: colors.accentAlt, opacity: 0.05,
    },
    bgBlue2: {
      position: 'absolute',
      bottom: 120, right: -80,
      width: 280, height: 280, borderRadius: 140,
      backgroundColor: colors.accent, opacity: 0.05,
    },

    /* ── Header ── */
    header: {
      height: Platform.OS === 'ios' ? 96 : 68,
      paddingTop: Platform.OS === 'ios' ? 48 : 10,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 12,
      backgroundColor: colors.bgSecondary,
      alignItems: 'center', justifyContent: 'center',
    },
    headerInfo: {
      alignItems: 'center',
      flex: 1,
    },
    headerTitle: {
      fontSize: 16, fontFamily: 'Cairo_700Bold', color: colors.accent,
    },
    statusRow: {
      flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2,
    },
    statusDot: {
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: colors.accentAlt,
      shadowColor: colors.accentAlt, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8, shadowRadius: 4, elevation: 2,
    },
    statusText: {
      fontSize: 10, fontFamily: 'Cairo_600SemiBold',
      color: colors.accentAlt, letterSpacing: 0.4,
    },

    /* AI avatar */
    avatarWrap: {
      width: 44, height: 44,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarGlow: {
      position: 'absolute', width: 52, height: 52, borderRadius: 26,
      backgroundColor: colors.accent,
    },
    avatarCircle: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.accent, zIndex: 1,
    },
    robotFace: {
      width: 26, height: 18, borderRadius: 9,
      backgroundColor: colors.bg,
      justifyContent: 'center', alignItems: 'center',
    },
    robotEyes: {
      width: 15, height: 5, borderRadius: 3, backgroundColor: colors.accent,
    },

    /* ── Stream ── */
    streamContent: {
      paddingHorizontal: 18, paddingTop: 20, paddingBottom: 160,
    },
    msgWrapper: {
      flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 18,
    },
    msgWrapperUser: {
      flexDirection: 'row-reverse',
    },

    /* Bubbles */
    aiBubble: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1, borderColor: colors.borderLight,
      borderRadius: 20, borderBottomLeftRadius: 4,
      paddingVertical: 12, paddingHorizontal: 16,
      maxWidth: width - 90,
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
    },
    userBubble: {
      backgroundColor: colors.accent + '15',
      borderWidth: 1, borderColor: colors.accent + '40',
      borderRadius: 20, borderBottomRightRadius: 4,
      paddingVertical: 12, paddingHorizontal: 16,
      maxWidth: width - 90,
    },
    bubbleText: {
      fontSize: 14, fontFamily: 'Cairo_500Medium',
      color: colors.textPrimary, lineHeight: 23,
    },
    userBubbleText: {
      color: colors.textPrimary,
    },

    /* Avatar dot */
    bubbleAvatar: {
      width: 34, height: 34, borderRadius: 17,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: colors.accent, flexShrink: 0,
    },
    miniRobotFace: {
      width: 20, height: 14, borderRadius: 7,
      backgroundColor: colors.bg,
      justifyContent: 'center', alignItems: 'center',
    },
    miniRobotEyes: {
      width: 11, height: 4, borderRadius: 2, backgroundColor: colors.accent,
    },

    /* Chips */
    chipsRow: {
      flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginTop: 12,
    },
    chip: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1, borderColor: colors.accent + '40',
      borderRadius: 16, paddingVertical: 5, paddingHorizontal: 12,
    },
    chipText: {
      fontSize: 11, fontFamily: 'Cairo_700Bold', color: colors.accent,
    },

    /* ── Goal card ── */
    goalCard: {
      flex: 1, backgroundColor: colors.surfaceElevated,
      borderRadius: 20, borderWidth: 1, borderColor: colors.accent + '44',
      padding: 16, maxWidth: width - 90,
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
    },
    goalCardHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      alignSelf: 'flex-end', marginBottom: 10,
    },
    goalCardHeaderText: {
      fontSize: 10, fontFamily: 'Cairo_700Bold', color: colors.accent, letterSpacing: 0.5,
    },
    goalContent: {
      backgroundColor: colors.surface, borderRadius: 12,
      padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border,
    },
    goalText: {
      fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary,
      textAlign: 'center', lineHeight: 22,
    },
    goalInput: {
      fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary,
      padding: 0, height: 40, borderBottomWidth: 1.5, borderBottomColor: colors.accent,
      textAlign: 'center',
    },
    goalPrompt: {
      fontSize: 11, fontFamily: 'Cairo_600SemiBold', color: colors.textMuted,
      textAlign: 'center', marginBottom: 14, lineHeight: 18,
    },
    goalBtnsRow: {
      flexDirection: 'row', gap: 8,
    },
    goalBtnSecondary: {
      flex: 0.8, height: 40, borderRadius: 12,
      borderWidth: 1.5, borderColor: colors.accent,
      backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center',
    },
    goalBtnSecondaryText: {
      fontSize: 12, fontFamily: 'Cairo_700Bold', color: colors.accent,
    },
    goalBtnPrimary: {
      flex: 1, height: 40, borderRadius: 12,
      backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
    },
    goalBtnPrimaryText: {
      fontSize: 12, fontFamily: 'Cairo_700Bold', color: '#FFFFFF',
    },

    /* ── Typing indicator ── */
    typingRow: {
      flexDirection: 'row', gap: 5, alignItems: 'center',
    },
    typingDot: {
      width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.textMuted,
    },

    /* ── Input area ── */
    inputArea: {
      position: 'absolute', bottom: 70, left: 0, right: 0,
      backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border,
      paddingHorizontal: 14, paddingVertical: 12,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
    },
    sendBtnDisabled: {
      backgroundColor: colors.border, shadowOpacity: 0,
    },
    inputWrap: {
      flex: 1, height: 44, backgroundColor: colors.inputBg,
      borderWidth: 1, borderColor: colors.borderLight, borderRadius: 22,
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    },
    input: {
      flex: 1, fontFamily: 'Cairo_400Regular', fontSize: 13,
      color: colors.textPrimary, height: '100%', paddingRight: 8,
    },
    micBtn: {
      padding: 4,
    },
  });
}
