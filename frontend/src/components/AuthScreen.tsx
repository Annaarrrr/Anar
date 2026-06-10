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
import { Mail, Lock, Globe } from 'lucide-react-native';
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
      backgroundColor: colors.accent, opacity: 0.07,
    },
    bgTeal: {
      position: 'absolute',
      bottom: 160, left: -80,
      width: 240, height: 240, borderRadius: 120,
      backgroundColor: colors.accentAlt, opacity: 0.05,
    },
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 32,
      padding: 30,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo_700Bold',
      color: colors.accent,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      fontFamily: 'Cairo_400Regular',
      color: colors.textSecondary,
      marginTop: 6,
      textAlign: 'center',
      lineHeight: 20,
    },
    socialContainer: {
      gap: 12,
    },
    appleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      height: 52,
      gap: 10,
    },
    appleBtnText: {
      color: colors.textPrimary,
      fontFamily: 'Cairo_700Bold',
      fontSize: 14,
    },
    appleIcon: {
      fontSize: 18,
    },
    googleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      height: 52,
      gap: 10,
    },
    googleBtnText: {
      color: colors.textPrimary,
      fontFamily: 'Cairo_700Bold',
      fontSize: 14,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 13,
      fontFamily: 'Cairo_600SemiBold',
      color: colors.textMuted,
    },
    errorText: {
      color: '#EF4444',
      fontSize: 12,
      fontFamily: 'Cairo_600SemiBold',
      backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
      padding: 10,
      borderRadius: 10,
      marginBottom: 16,
      textAlign: 'right',
    },
    form: {
      gap: 14,
    },
    inputContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.bgSecondary,
      paddingHorizontal: 16,
      height: 52,
    },
    inputIcon: {
      marginLeft: 10,
    },
    input: {
      flex: 1,
      fontFamily: 'Cairo_400Regular',
      fontSize: 14,
      color: colors.textPrimary,
      textAlign: 'right',
      height: '100%',
    },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryBtnDisabled: {
      opacity: 0.7,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontFamily: 'Cairo_700Bold',
      fontSize: 15,
    },
    switchButton: {
      marginTop: 18,
      alignItems: 'center',
    },
    switchText: {
      color: colors.accent,
      fontFamily: 'Cairo_600SemiBold',
      fontSize: 13,
    },
    footerContainer: {
      marginTop: 24,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 11,
      fontFamily: 'Cairo_400Regular',
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
    footerLink: {
      color: colors.accent,
      fontFamily: 'Cairo_600SemiBold',
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
    title:       isRTL ? 'مرحباً بك'                                  : 'Welcome Back',
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
              <TouchableOpacity onPress={handleAppleLogin} style={styles.appleBtn}>
                <Text style={styles.appleBtnText}>{s.apple}</Text>
                <Text style={styles.appleIcon}>🍏</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleGoogleLogin} style={styles.googleBtn}>
                <Text style={styles.googleBtnText}>{s.google}</Text>
                <Globe size={18} color="#EA4335" />
              </TouchableOpacity>
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
                <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
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
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
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

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              >
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.primaryBtnText}>{isLogin ? s.login : s.signup}</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Form Switcher */}
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
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
