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
} from 'react-native';
import { ArrowRight, Mic, Send } from 'lucide-react-native';
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

    // Simulate AI thinking and dynamically generate replies + goals
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
        // Fallback for general custom goals
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

      // Show a brief success message then navigate to the board
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header Bar */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Right: Back Arrow */}
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <ArrowRight size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Center: AI info */}
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.accentAlt }]}>{t.chat_title}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>{t.chat_online}</Text>
              <View style={styles.statusDot} />
            </View>
          </View>

          {/* Left: Robot mascot avatar */}
          <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
            <View style={styles.robotFace}>
              <View style={[styles.robotEyes, { backgroundColor: colors.accentAlt }]} />
            </View>
          </View>
        </View>

        {/* Message Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.streamContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={styles.msgWrapper}>
              {/* Message Bubble */}
              <View style={
                msg.role === 'user'
                  ? [styles.userBubble, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '44' }]
                  : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }]
              }>
                <Text style={[styles.bubbleText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>{msg.text}</Text>

                {/* Show Suggestion pills in the first AI message */}
                {msg.id === 1 && (
                  <View style={styles.chipsRow}>
                    <TouchableOpacity
                      onPress={() => handleChipSelect(isRTL ? 'تنظيم الوقت' : 'time')}
                      style={[styles.suggestionChip, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40' }]}
                    >
                      <Text style={[styles.suggestionChipText, { color: colors.accent }]}>{t.chip_time}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleChipSelect(isRTL ? 'تطوير مهارة' : 'skill')}
                      style={[styles.suggestionChip, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40' }]}
                    >
                      <Text style={[styles.suggestionChipText, { color: colors.accent }]}>{t.chip_skill}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleChipSelect(isRTL ? 'دراستي' : 'study')}
                      style={[styles.suggestionChip, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40' }]}
                    >
                      <Text style={[styles.suggestionChipText, { color: colors.accent }]}>{t.chip_study}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Bot Avatar next to bot messages */}
              {msg.role === 'ai' && (
                <View style={styles.bubbleAvatar}>
                  <View style={styles.miniRobotFace}>
                    <View style={styles.miniRobotEyes} />
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Suggested Goal Card Overlay */}
          {suggestedGoal && (
            <View style={styles.suggestionCardContainer}>
              <View style={[styles.suggestionCard, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40' }]}>
                {/* Header */}
                <View style={styles.suggestionHeader}>
                  <Text style={[styles.suggestionHeaderText, { color: colors.accent }]}>{t.chat_goal_proposed}</Text>
                </View>

                {/* Suggested goal content */}
                <View style={[styles.suggestionGoalContent, { backgroundColor: colors.surface }]}>
                  {isEditingGoal ? (
                    <TextInput
                      style={styles.suggestionGoalInput}
                      value={editedGoalText}
                      onChangeText={setEditedGoalText}
                      textAlign="center"
                      autoFocus
                    />
                  ) : (
                    <Text style={[styles.suggestionGoalTitle, { color: colors.textPrimary }]}>{suggestedGoal}</Text>
                  )}
                </View>

                {/* Text prompt */}
                <Text style={styles.suggestionPrompt}>
                  {isEditingGoal
                    ? 'عدل نص الهدف المكتوب أعلاه ثم احفظه'
                    : 'سيتم تثبيته كبطاقة في لوحة الرؤية وإنشاء خريطة رحلة مخصصة لك 📌'}
                </Text>

                {/* Action Buttons */}
                <View style={styles.suggestionButtonsRow}>
                  {isEditingGoal ? (
                    <>
                      <TouchableOpacity
                        onPress={() => setIsEditingGoal(false)}
                        style={styles.editGoalBtn}
                      >
                        <Text style={[styles.editGoalBtnText, { color: colors.accent }]}>{t.chat_cancel}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          if (editedGoalText.trim()) {
                            setSuggestedGoal(editedGoalText);
                          }
                          setIsEditingGoal(false);
                        }}
                        style={[styles.acceptGoalBtn, { backgroundColor: colors.accentAlt }]}
                      >
                        <Text style={styles.acceptGoalBtnText}>{t.chat_save}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={handleEditGoal}
                        style={[styles.editGoalBtn, { borderColor: colors.accent }]}
                      >
                        <Text style={[styles.editGoalBtnText, { color: colors.accent }]}>{t.chat_edit_goal}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleAcceptGoal}
                        disabled={creating}
                        style={[styles.acceptGoalBtn, { backgroundColor: colors.accentAlt }]}
                      >
                        {creating ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text style={styles.acceptGoalBtnText}>نعم، اعتمد الهدف</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* Mini robot avatar next to suggestion card */}
              <View style={styles.bubbleAvatar}>
                <View style={styles.miniRobotFace}>
                  <View style={styles.miniRobotEyes} />
                </View>
              </View>
            </View>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.msgWrapper}>
              <View style={styles.aiBubble}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotDelay1]} />
                  <View style={[styles.typingDot, styles.typingDotDelay2]} />
                </View>
              </View>
              <View style={styles.bubbleAvatar}>
                <View style={styles.miniRobotFace}>
                  <View style={styles.miniRobotEyes} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Input Area */}
        <View style={[styles.inputArea, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => handleSendMessage()} style={[styles.sendCircle, { backgroundColor: colors.accentAlt }]}>
            <Text style={styles.sendArrowText}>◄</Text>
          </TouchableOpacity>

          <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <TextInput
              placeholder={t.chat_placeholder}
              placeholderTextColor={colors.textMuted}
              value={inputVal}
              onChangeText={setInputVal}
              style={[styles.input, { color: colors.textPrimary }]}
              textAlign={isRTL ? 'right' : 'left'}
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity
              onPress={() => Alert.alert(isRTL ? 'التسجيل الصوتي' : 'Voice Input', isRTL ? 'ميزة الإدخال الصوتي ستتوفر قريباً' : 'Voice input coming soon')}
              style={styles.micBtn}
            >
              <Mic size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderColor: '#F1F3F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 6,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Cairo_700Bold',
    color: '#006C54', // Greenish teal as in chat.png
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    color: '#10B981',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotFace: {
    width: 28,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotEyes: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00BFA6',
  },
  streamContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 170, // Space for raised input bar (70px tab bar + 80px input area height)
  },
  msgWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    gap: 12,
  },
  userBubble: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1.5,
    borderColor: '#BEE3F8',
    borderRadius: 20,
    borderTopRightRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: width - 80,
    alignSelf: 'flex-start',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderTopLeftRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: width - 85,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: 'Cairo_500Medium',
    color: '#1E293B',
    lineHeight: 22,
    textAlign: 'right',
  },
  bubbleAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  miniRobotFace: {
    width: 24,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniRobotEyes: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00BFA6',
  },
  chipsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  suggestionChip: {
    backgroundColor: '#F3F0FF',
    borderWidth: 1,
    borderColor: '#DCD6FD',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  suggestionChipText: {
    fontSize: 12,
    fontFamily: 'Cairo_700Bold',
    color: '#6C5CE7',
  },
  suggestionCardContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    gap: 12,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DCE2FD',
    padding: 16,
    maxWidth: width - 85,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  suggestionHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  suggestionHeaderText: {
    fontSize: 11,
    fontFamily: 'Cairo_700Bold',
    color: '#6C5CE7',
  },
  suggestionGoalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  suggestionGoalTitle: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  suggestionGoalInput: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#1E293B',
    padding: 0,
    height: 40,
    borderBottomWidth: 1.5,
    borderBottomColor: '#6C5CE7',
  },
  suggestionPrompt: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 14,
  },
  suggestionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptGoalBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#00BFA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptGoalBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Cairo_700Bold',
    fontSize: 12,
  },
  editGoalBtn: {
    flex: 0.8,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editGoalBtnText: {
    color: '#6C5CE7',
    fontFamily: 'Cairo_700Bold',
    fontSize: 12,
  },
  typingIndicator: {
    flexDirection: 'row-reverse',
    gap: 4,
    alignItems: 'center',
    paddingVertical: 4,
    width: 40,
    justifyContent: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.3,
  },
  inputArea: {
    position: 'absolute',
    bottom: 70, // Sits above the 70px tab bar
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderColor: '#F1F3F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sendCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00BFA6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  sendArrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: -2,
  },
  inputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  micBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#1E293B',
    height: '100%',
    paddingRight: 10,
  },
});
