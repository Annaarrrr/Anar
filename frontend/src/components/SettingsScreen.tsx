import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X, Moon, Sun, Globe, LogOut, Check } from 'lucide-react-native';
import { useAppSettings } from '../context/AppContext';
import { Language, Theme } from '../types';

interface Props {
  onClose:  () => void;
  onLogout: () => void;
}

export function SettingsScreen({ onClose, onLogout }: Props) {
  const { t, colors, language, theme, setLanguage, setTheme, isRTL } = useAppSettings();

  const handleLogout = () => {
    Alert.alert(
      t.settings_logout,
      t.settings_logout_msg,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.settings_logout, onPress: () => { onClose(); onLogout(); }, style: 'destructive' },
      ]
    );
  };

  const OptionBtn = ({
    label, selected, onPress, icon,
  }: { label: string; selected: boolean; onPress: () => void; icon?: React.ReactNode }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        ss.optionBtn,
        { backgroundColor: selected ? colors.accent + '18' : colors.bgSecondary,
          borderColor:      selected ? colors.accent : colors.border },
      ]}
      activeOpacity={0.75}
    >
      {icon && <View style={ss.optionIcon}>{icon}</View>}
      <Text style={[ss.optionLabel, { color: selected ? colors.accent : colors.textSecondary }]}>
        {label}
      </Text>
      {selected && (
        <View style={[ss.checkDot, { backgroundColor: colors.accent }]}>
          <Check size={10} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const SectionTitle = ({ children }: { children: string }) => (
    <Text style={[ss.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
      {children}
    </Text>
  );

  return (
    <View style={[ss.container, { backgroundColor: colors.bg }]}>

      {/* Handle + Header */}
      <View style={[ss.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={[ss.closeBtn, { backgroundColor: colors.surfaceElevated }]}>
          <X size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[ss.headerTitle, { color: colors.textPrimary }]}>{t.settings_title}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={ss.body} showsVerticalScrollIndicator={false}>

        {/* ── Appearance ── */}
        <View style={[ss.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SectionTitle>{t.settings_appearance}</SectionTitle>

          {/* Theme */}
          <View style={ss.row}>
            <Text style={[ss.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.settings_theme}
            </Text>
          </View>
          <View style={ss.optionRow}>
            <OptionBtn
              label={t.settings_theme_light}
              selected={theme === 'light'}
              onPress={() => setTheme('light')}
              icon={<Sun size={14} color={theme === 'light' ? colors.accent : colors.textMuted} />}
            />
            <OptionBtn
              label={t.settings_theme_dark}
              selected={theme === 'dark'}
              onPress={() => setTheme('dark')}
              icon={<Moon size={14} color={theme === 'dark' ? colors.accent : colors.textMuted} />}
            />
          </View>

          <View style={[ss.divider, { backgroundColor: colors.border }]} />

          {/* Language */}
          <View style={ss.row}>
            <Text style={[ss.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t.settings_language}
            </Text>
          </View>
          <View style={ss.optionRow}>
            <OptionBtn
              label={t.settings_lang_ar}
              selected={language === 'ar'}
              onPress={() => setLanguage('ar')}
              icon={<Globe size={14} color={language === 'ar' ? colors.accent : colors.textMuted} />}
            />
            <OptionBtn
              label={t.settings_lang_en}
              selected={language === 'en'}
              onPress={() => setLanguage('en')}
              icon={<Globe size={14} color={language === 'en' ? colors.accent : colors.textMuted} />}
            />
          </View>
        </View>

        {/* ── Account ── */}
        <View style={[ss.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SectionTitle>{t.settings_account}</SectionTitle>
          <TouchableOpacity
            onPress={handleLogout}
            style={[
              ss.logoutBtn,
              {
                backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
                borderColor:     theme === 'dark' ? 'rgba(239,68,68,0.35)' : '#FCA5A5',
              },
            ]}
            activeOpacity={0.75}
          >
            <Text style={ss.logoutText}>{t.settings_logout}</Text>
            <LogOut size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text style={[ss.version, { color: colors.textMuted }]}>Anar v1.0.0</Text>

      </ScrollView>
    </View>
  );
}

const ss = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Cairo_700Bold',
  },
  body: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Cairo_600SemiBold',
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  optionIcon: {
    width: 16,
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: 'Cairo_700Bold',
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#EF4444',
  },
  version: {
    fontSize: 11,
    fontFamily: 'Cairo_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
});
