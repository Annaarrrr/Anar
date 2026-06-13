import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MailIcon, LockIcon, GlobeIcon } from './common/CustomIcons';
import { SketchButton } from './common/SketchButton';
import { api } from '../services/api';
import { useAppSettings } from '../context/AppContext';
import { Colors } from '../theme/colors';

interface Props {
  onAuthSuccess: (token: string) => void;
}

function makeStyles(colors: Colors, theme: 'light' | 'dark') {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
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
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 26,
      borderWidth: 2.5,
      borderColor: colors.border,
      // Solid offset shadow for sketchbook feel
      shadowColor: colors.border,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 26,
      fontFamily: 'Cairo_700Bold',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textSecondary,
      marginTop: 6,
      textAlign: 'center',
      lineHeight: 20,
    },
    socialContainer: {
      gap: 16,
    },
    socialBtnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    appleBtnText: {
      color: colors.textPrimary,
      fontFamily: 'Cairo_700Bold',
      fontSize: 14,
    },
    appleIcon: {
      fontSize: 16,
    },
    googleBtnText: {
      color: colors.textPrimary,
      fontFamily: 'Cairo_700Bold',
      fontSize: 14,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 18,
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      opacity: 0.25,
    },
    dividerText: {
      fontSize: 13,
      fontFamily: 'Cairo_700Bold',
      color: colors.textSecondary,
    },
    errorText: {
      color: '#EF4444',
      fontSize: 12,
      fontFamily: 'Cairo_700Bold',
      backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
      padding: 10,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: '#EF4444',
      marginBottom: 16,
      textAlign: 'center',
    },
    form: {
      gap: 14,
    },
    inputContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.bgSecondary,
      paddingHorizontal: 16,
      height: 52,
    },
    inputIcon: {
      marginLeft: 10,
    },
    input: {
      flex: 1,
      fontFamily: 'Cairo_600SemiBold',
      fontSize: 14,
      color: colors.textPrimary,
      textAlign: 'right',
      height: '100%',
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontFamily: 'Cairo_700Bold',
      fontSize: 15,
    },
    switchButton: {
      marginTop: 18,
      alignItems: 'center',
      alignSelf: 'center',
    },
    switchText: {
      color: colors.accent,
      fontFamily: 'Cairo_700Bold',
      fontSize: 13,
      textDecorationLine: 'underline',
    },
    footerContainer: {
      marginTop: 24,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 11,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
    footerLink: {
      color: colors.textPrimary,
      fontFamily: 'Cairo_700Bold',
      textDecorationLine: 'underline',
    },
  });
}

export function AuthScreen({ onAuthSuccess }: Props) {
  const { colors, theme, language } = useAppSettings();
  const styles = useMemo(() => makeStyles(colors, theme), [colors, theme]);
  const isRTL = language === 'ar';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bilingual strings
  const s = {
    title:       isRTL ? 'مرحباً بك في أنار'                         : 'Welcome to Anar',
    subtitle:    isRTL ? 'سجل دخولك أو أنشئ حساباً جديداً للبدء'     : 'Sign in or create a new account to get started',
    apple:       isRTL ? 'المتابعة باستخدام Apple'                     : 'Continue with Apple',
    google:      isRTL ? 'المتابعة باستخدام جوجل'                      : 'Continue with Google',
    or:          isRTL ? 'أو'                                           : 'or',
    email:       isRTL ? 'البريد الإلكتروني'                            : 'Email address',
    password:    isRTL ? 'كلمة المرور'                                  : 'Password',
    login:       isRTL ? 'دخول'                                         : 'Sign In',
    signup:      isRTL ? 'تسجيل جديد'                                   : 'Create Account',
    toSignup:    isRTL ? 'ليس لديك حساب؟ سجل الآن'                      : "Don't have an account? Sign up",
    toLogin:     isRTL ? 'لديك حساب بالفعل؟ سجل دخولك'                 : 'Already have an account? Sign in',
    terms:       isRTL ? 'بمتابعتك، أنت توافق على'                     : 'By continuing, you agree to our',
    termsLink:   isRTL ? 'الشروط والأحكام'                              : 'Terms of Service',
    and:         isRTL ? 'و'                                             : 'and',
    privLink:    isRTL ? 'سياسة الخصوصية'                               : 'Privacy Policy',
    errEmpty:    isRTL ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password',
    errApple:    isRTL ? 'فشل الدخول باستخدام Apple'                    : 'Apple sign-in failed',
    errGoogle:   isRTL ? 'فشل الدخول باستخدام Google'                   : 'Google sign-in failed',
    errGeneral:  isRTL ? 'فشلت العملية، الرجاء التحقق من البيانات'      : 'Something went wrong, please check your details',
  };

  const handleAppleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.login('apple_user@anar.app', 'password123');
      onAuthSuccess(res.token);
    } catch {
      setError(s.errApple);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.login('google_user@anar.app', 'password123');
      onAuthSuccess(res.token);
    } catch {
      setError(s.errGoogle);
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!email || !password) { setError(s.errEmpty); return; }
    setError(''); setLoading(true);
    try {
      const res = isLogin
        ? await api.login(email, password)
        : await api.signup(email, password);
      onAuthSuccess(res.token);
    } catch (err: any) {
      setError(err.message || s.errGeneral);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgPurple} />
      <View style={styles.bgTeal} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>
            </View>

            {/* Social Logins */}
            <View style={styles.socialContainer}>
              <SketchButton onPress={handleAppleLogin} variant="secondary">
                <View style={styles.socialBtnContent}>
                  <Text style={styles.appleBtnText}>{s.apple}</Text>
                  <Text style={styles.appleIcon}>🍏</Text>
                </View>
              </SketchButton>

              <SketchButton onPress={handleGoogleLogin} variant="secondary">
                <View style={styles.socialBtnContent}>
                  <Text style={styles.googleBtnText}>{s.google}</Text>
                  <GlobeIcon size={18} color="#EA4335" />
                </View>
              </SketchButton>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{s.or}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MailIcon size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder={s.email}
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <LockIcon size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder={s.password}
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <SketchButton
                  onPress={handleSubmit}
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{isLogin ? s.login : s.signup}</Text>
                  )}
                </SketchButton>
              </View>
            </View>

            {/* Form Switcher */}
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton} activeOpacity={0.7}>
              <Text style={styles.switchText}>{isLogin ? s.toSignup : s.toLogin}</Text>
            </TouchableOpacity>

            {/* Terms footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {s.terms}{' '}
                <Text style={styles.footerLink}>{s.termsLink}</Text>
                {' '}{s.and}{' '}
                <Text style={styles.footerLink}>{s.privLink}</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
