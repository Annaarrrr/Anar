import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { CustomAlert as Alert } from './common/Alert';
import { ArrowLeftIcon, ArrowRightIcon, MicIcon, SendIcon, SparklesIcon } from './common/CustomIcons';
import { SketchButton } from './common/SketchButton';
import { ActiveTab, Message } from '../types';
import { api } from '../services/api';
import { useAppSettings } from '../context/AppContext';
import { Mascot } from './Mascot';

const { width } = Dimensions.get('window');

interface Props {
  onNavigate: (s: ActiveTab) => void;
  refreshGoal: () => Promise<void>;
  active?: boolean;
}

interface ChatMessageRowProps {
  msg: Message;
  isRTL: boolean;
  t: any;
  handleChipSelect: (chipText: string) => void;
  styles: any;
}

const ChatMessageRow = React.memo(({
  msg,
  isRTL,
  t,
  handleChipSelect,
  styles,
}: ChatMessageRowProps) => {
  return (
    <View
      style={[
        styles.msgWrapper,
        msg.role === 'user' && styles.msgWrapperUser,
      ]}
    >
      {/* AI avatar dot */}
      {msg.role === 'ai' && (
        <View style={[styles.bubbleAvatar, { backgroundColor: 'transparent', borderWidth: 0 }]}>
          <Mascot size={32} animated={false} />
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12, marginHorizontal: -16 }}
            contentContainerStyle={[styles.chipsContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
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
          </ScrollView>
        )}
      </View>
    </View>
  );
});
ChatMessageRow.displayName = 'ChatMessageRow';

function ChatScreenInner({ onNavigate, refreshGoal, active = false }: Props) {
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

  const flatListRef = useRef<FlatList>(null);

  // Pulsing glow on avatar
  const avatarGlow = useRef(new Animated.Value(0.6)).current;
  // Typing dot animations
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      avatarGlow.setValue(0.6);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarGlow, { toValue: 1,   duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(avatarGlow, { toValue: 0.5, duration: 1600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

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

  const handleSendMessage = React.useCallback((textToSend?: string) => {
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
  }, [inputVal, isRTL]);

  const handleChipSelect = React.useCallback((chipText: string) => {
    let text = '';
    if (chipText === 'دراستي' || chipText === 'study') {
      text = isRTL ? 'أريد أن أدرس وأحسّن مستواي الأكاديمي' : 'I want to study and improve my academic level';
    } else if (chipText === 'تطوير مهارة' || chipText === 'skill') {
      text = isRTL ? 'أريد أن أتعلم البرمجة، لكني لا أعرف من أين أبدأ وأشعر بالضياع قليلاً.' : "I want to learn programming, but I don't know where to start and feel a bit lost.";
    } else {
      text = isRTL ? 'أريد تنظيم وقتي وإدارة مهامي اليومية بشكل أفضل' : 'I want to organize my time and manage my daily tasks better';
    }
    handleSendMessage(text);
  }, [isRTL, handleSendMessage]);

  const handleAcceptGoal = async () => {
    if (!suggestedGoal) return;
    setCreating(true);
    try {
      await api.createGoal(suggestedGoal);
      await refreshGoal();

      const successMsg: Message = {
        id: Date.now() + 2,
        role: 'ai',
        text: isRTL 
          ? `تم تثبيت هدفك "${suggestedGoal}" على لوحة الرؤية 📌 وتم إنشاء خريطة رحلة مخصصة لك! اضغط على البطاقة في اللوحة لعرض مسارك.`
          : `Your goal "${suggestedGoal}" has been pinned to the Vision Board 📌 and a custom journey map has been created! Tap the card to view your path.`,
        time: new Date().toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, successMsg]);
      setSuggestedGoal(null);

      setTimeout(() => onNavigate('vision'), 1400);
    } catch (err) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل اعتماد الهدف، يرجى المحاولة مرة أخرى.' : 'Failed to approve goal, please try again.');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn} activeOpacity={0.7}>
            {isRTL ? (
              <ArrowRightIcon size={20} color={colors.textPrimary} />
            ) : (
              <ArrowLeftIcon size={20} color={colors.textPrimary} />
            )}
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{t.chat_title}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t.chat_online}</Text>
            </View>
          </View>

          {/* AI Avatar with sketch style */}
          <View style={styles.avatarWrap}>
            <Mascot size={42} />
          </View>
        </View>

        {/* ── Message stream ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ChatMessageRow
              msg={item}
              isRTL={isRTL}
              t={t}
              handleChipSelect={handleChipSelect}
              styles={styles}
            />
          )}
          contentContainerStyle={styles.streamContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews={Platform.OS === 'android'}
          ListFooterComponent={
            <View>
              {/* ── Suggested Goal Card ── */}
              {suggestedGoal && (
                <View style={styles.msgWrapper}>
                  <View style={[styles.bubbleAvatar, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                    <Mascot size={32} animated={false} />
                  </View>
                  <View style={styles.goalCard}>
                    {/* Card header */}
                    <View style={styles.goalCardHeader}>
                      <SparklesIcon size={14} color={colors.accent} />
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
                          placeholderTextColor={colors.textMuted}
                        />
                      ) : (
                        <Text style={styles.goalText}>{suggestedGoal}</Text>
                      )}
                    </View>

                    <Text style={styles.goalPrompt}>
                      {isEditingGoal
                        ? (isRTL ? 'عدل نص الهدف المكتوب أعلاه ثم احفظه' : 'Edit the goal text above and save it')
                        : (isRTL ? 'سيتم تثبيته كبطاقة في لوحة الرؤية وإنشاء خريطة رحلة مخصصة لك 📌' : 'It will be pinned to your vision board and a custom journey map will be created for you 📌')}
                    </Text>

                    {/* Action buttons */}
                    <View style={styles.goalBtnsRow}>
                      {isEditingGoal ? (
                        <>
                          <View style={{ flex: 0.8 }}>
                            <SketchButton
                              onPress={() => setIsEditingGoal(false)}
                              variant="secondary"
                              style={{ height: 40 }}
                              textStyle={{ fontSize: 12 }}
                              title={t.chat_cancel}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <SketchButton
                              onPress={() => {
                                if (editedGoalText.trim()) setSuggestedGoal(editedGoalText);
                                setIsEditingGoal(false);
                              }}
                              variant="primary"
                              style={{ height: 40 }}
                              textStyle={{ fontSize: 12 }}
                              title={t.chat_save}
                            />
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={{ flex: 0.8 }}>
                            <SketchButton
                              onPress={handleEditGoal}
                              variant="secondary"
                              style={{ height: 40 }}
                              textStyle={{ fontSize: 12 }}
                              title={t.chat_edit_goal}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <SketchButton
                              onPress={handleAcceptGoal}
                              disabled={creating}
                              variant="primary"
                              style={{ height: 40 }}
                            >
                              {creating ? (
                                <ActivityIndicator color="white" />
                              ) : (
                                <Text style={[styles.primaryBtnText, { fontSize: 12 }]}>
                                  {t.chat_accept_goal}
                                </Text>
                              )}
                            </SketchButton>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* ── Typing indicator ── */}
              {isTyping && (
                <View style={styles.msgWrapper}>
                  <View style={[styles.bubbleAvatar, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                    <Mascot size={32} animated={false} />
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
            </View>
          }
        />

        {/* ── Input area ── */}
        <View style={styles.inputArea}>
          {/* Send button */}
          <TouchableOpacity
            onPress={() => handleSendMessage()}
            disabled={!inputVal.trim()}
            style={[styles.sendBtn, !inputVal.trim() && styles.sendBtnDisabled]}
            activeOpacity={0.8}
          >
            <SendIcon size={18} color={!inputVal.trim() ? colors.textMuted : '#FFFFFF'} />
          </TouchableOpacity>

          {/* Text input */}
          <View style={styles.inputWrap}>
            <TextInput
              placeholder={t.chat_placeholder}
              placeholderTextColor={colors.textMuted}
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
              activeOpacity={0.7}
            >
              <MicIcon size={18} color={colors.textSecondary} />
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
      backgroundColor: 'transparent',
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
      borderBottomWidth: 2,
      borderColor: colors.border,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 2, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.border, shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 2,
    },
    headerInfo: {
      alignItems: 'center',
      flex: 1,
    },
    headerTitle: {
      fontSize: 16, fontFamily: 'Cairo_700Bold', color: colors.textPrimary,
    },
    statusRow: {
      flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2,
    },
    statusDot: {
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: colors.accent,
      borderWidth: 1.5, borderColor: colors.border,
    },
    statusText: {
      fontSize: 10, fontFamily: 'Cairo_700Bold',
      color: colors.textSecondary, letterSpacing: 0.4,
    },

    /* AI avatar */
    avatarWrap: {
      width: 44, height: 44,
      alignItems: 'center', justifyContent: 'center',
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
      backgroundColor: colors.surface,
      borderWidth: 2, borderColor: colors.border,
      borderRadius: 18, borderBottomLeftRadius: 4,
      paddingVertical: 12, paddingHorizontal: 16,
      maxWidth: width - 90,
      shadowColor: colors.border, shadowOffset: { width: 2.5, height: 2.5 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 3,
    },
    userBubble: {
      backgroundColor: colors.accent + '22',
      borderWidth: 2, borderColor: colors.border,
      borderRadius: 18, borderBottomRightRadius: 4,
      paddingVertical: 12, paddingHorizontal: 16,
      maxWidth: width - 90,
      shadowColor: colors.border, shadowOffset: { width: 2.5, height: 2.5 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 3,
    },
    bubbleText: {
      fontSize: 14, fontFamily: 'Cairo_600SemiBold',
      color: colors.textPrimary, lineHeight: 23,
    },
    userBubbleText: {
      color: colors.textPrimary,
    },

    /* Avatar dot */
    bubbleAvatar: {
      width: 34, height: 34,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },

    /* Chips */
    chipsContent: {
      gap: 8, paddingHorizontal: 16,
    },
    chip: {
      backgroundColor: colors.surface,
      borderWidth: 2, borderColor: colors.border,
      borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12,
      shadowColor: colors.border, shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 2,
    },
    chipText: {
      fontSize: 11, fontFamily: 'Cairo_700Bold', color: colors.textPrimary,
    },

    /* ── Goal card ── */
    goalCard: {
      flex: 1, backgroundColor: colors.surface,
      borderRadius: 18, borderWidth: 2.5, borderColor: colors.border,
      padding: 16, maxWidth: width - 90,
      shadowColor: colors.border, shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    },
    goalCardHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      alignSelf: 'flex-end', marginBottom: 10,
    },
    goalCardHeaderText: {
      fontSize: 11, fontFamily: 'Cairo_700Bold', color: colors.accent, letterSpacing: 0.5,
    },
    goalContent: {
      backgroundColor: colors.bgSecondary, borderRadius: 12,
      padding: 14, marginBottom: 12, borderWidth: 2, borderColor: colors.border,
    },
    goalText: {
      fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary,
      textAlign: 'center', lineHeight: 24,
    },
    goalInput: {
      fontSize: 14, fontFamily: 'Cairo_700Bold', color: colors.textPrimary,
      padding: 0, height: 40, borderBottomWidth: 2, borderBottomColor: colors.accent,
      textAlign: 'center',
    },
    goalPrompt: {
      fontSize: 11, fontFamily: 'Cairo_600SemiBold', color: colors.textMuted,
      textAlign: 'center', marginBottom: 14, lineHeight: 21,
    },
    goalBtnsRow: {
      flexDirection: 'row', gap: 8,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontFamily: 'Cairo_700Bold',
    },

    /* ── Typing indicator ── */
    typingRow: {
      flexDirection: 'row', gap: 5, alignItems: 'center',
    },
    typingDot: {
      width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.border,
    },

    /* ── Input area ── */
    inputArea: {
      position: 'absolute', bottom: 70, left: 0, right: 0,
      backgroundColor: colors.surface, borderTopWidth: 2, borderColor: colors.border,
      paddingHorizontal: 14, paddingVertical: 12,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.border,
      shadowColor: colors.border, shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1, shadowRadius: 0, elevation: 3,
    },
    sendBtnDisabled: {
      backgroundColor: colors.bgSecondary,
      opacity: 0.5,
    },
    inputWrap: {
      flex: 1, height: 44, backgroundColor: colors.inputBg,
      borderWidth: 2, borderColor: colors.border, borderRadius: 12,
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    },
    input: {
      flex: 1, fontFamily: 'Cairo_600SemiBold', fontSize: 13,
      color: colors.textPrimary, height: '100%', paddingRight: 8,
    },
    micBtn: {
      padding: 4,
    },
  });
}

export const ChatScreen = React.memo(ChatScreenInner);
