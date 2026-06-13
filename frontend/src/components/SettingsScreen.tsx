import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { showAlert } from './common/Alert';
import { XIcon, MoonIcon, SunIcon, GlobeIcon, LogOutIcon, CheckIcon } from './common/CustomIcons';
import { NotebookBackground } from './common/NotebookBackground';
import { useAppSettings } from '../context/AppContext';
import { Language, Theme } from '../types';

interface Props {
  onClose:  () => void;
  onLogout: () => void;
}

const OptionBtn = React.memo(({
  label, selected, onPress, icon,
}: { label: string; selected: boolean; onPress: () => void; icon?: React.ReactNode }) => {
  const { colors, theme } = useAppSettings();
  const selectedBg = theme === 'dark' ? '#332515' : '#FFEAD2';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        ss.optionBtn,
        {
          backgroundColor: selected ? selectedBg : colors.bg,
          borderColor: colors.border,
          shadowColor: colors.border,
        },
      ]}
      activeOpacity={0.75}
    >
      {icon && <View style={ss.optionIcon}>{icon}</View>}
      <Text style={[ss.optionLabel, { color: colors.textPrimary, backgroundColor: 'transparent' }]}>
        {label}
      </Text>
      {selected && (
        <View style={[ss.checkDot, { backgroundColor: colors.accent, borderColor: colors.border }]}>
          <CheckIcon size={10} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
});
OptionBtn.displayName = 'OptionBtn';

const SectionTitle = React.memo(({ children }: { children: string }) => {
  const { colors, isRTL } = useAppSettings();
  return (
    <Text style={[ss.sectionTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left', backgroundColor: 'transparent' }]}>
      {children}
    </Text>
  );
});
SectionTitle.displayName = 'SectionTitle';

function SettingsScreenInner({ onClose, onLogout }: Props) {
  const { t, colors, language, theme, setLanguage, setTheme, isRTL } = useAppSettings();

  const handleLogout = () => {
    showAlert(
      t.settings_logout,
      t.settings_logout_msg,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.settings_logout, onPress: () => { onClose(); onLogout(); }, style: 'destructive' },
      ]
    );
  };



  return (
    <View style={[ss.container, { backgroundColor: colors.bg }]}>
      <NotebookBackground />

      {/* Handle + Header */}
      <View style={[ss.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={[ss.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.7}>
          <XIcon size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[ss.headerTitle, { color: colors.textPrimary, backgroundColor: 'transparent' }]}>{t.settings_title}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={ss.body} showsVerticalScrollIndicator={false}>

        {/* ── Appearance ── */}
        <View style={[ss.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.border }]}>
          <SectionTitle>{t.settings_appearance}</SectionTitle>

          {/* Theme */}
          <View style={ss.row}>
            <Text style={[ss.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', backgroundColor: 'transparent' }]}>
              {t.settings_theme}
            </Text>
          </View>
          <View style={ss.optionRow}>
            <OptionBtn
              label={t.settings_theme_light}
              selected={theme === 'light'}
              onPress={() => setTheme('light')}
              icon={<SunIcon size={14} color={theme === 'light' ? colors.accent : colors.textMuted} />}
            />
            <OptionBtn
              label={t.settings_theme_dark}
              selected={theme === 'dark'}
              onPress={() => setTheme('dark')}
              icon={<MoonIcon size={14} color={theme === 'dark' ? colors.accent : colors.textMuted} />}
            />
          </View>

          <View style={[ss.divider, { backgroundColor: colors.border }]} />

          {/* Language */}
          <View style={ss.row}>
            <Text style={[ss.rowLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', backgroundColor: 'transparent' }]}>
              {t.settings_language}
            </Text>
          </View>
          <View style={ss.optionRow}>
            <OptionBtn
              label={t.settings_lang_ar}
              selected={language === 'ar'}
              onPress={() => setLanguage('ar')}
              icon={<GlobeIcon size={14} color={language === 'ar' ? colors.accent : colors.textMuted} />}
            />
            <OptionBtn
              label={t.settings_lang_en}
              selected={language === 'en'}
              onPress={() => setLanguage('en')}
              icon={<GlobeIcon size={14} color={language === 'en' ? colors.accent : colors.textMuted} />}
            />
          </View>
        </View>

        {/* ── Account ── */}
        <View style={[ss.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.border }]}>
          <SectionTitle>{t.settings_account}</SectionTitle>
          <TouchableOpacity
            onPress={handleLogout}
            style={[
              ss.logoutBtn,
              {
                backgroundColor: theme === 'dark' ? '#2D1215' : '#FEF2F2',
                borderColor:     '#EF4444',
                shadowColor:     '#EF4444',
              },
            ]}
            activeOpacity={0.75}
          >
            <Text style={[ss.logoutText, { backgroundColor: 'transparent' }]}>{t.settings_logout}</Text>
            <LogOutIcon size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text style={[ss.version, { color: colors.textMuted, backgroundColor: 'transparent' }]}>Anar v1.0.0</Text>

      </ScrollView>
    </View>
  );
}

export const SettingsScreen = React.memo(SettingsScreenInner);

const ss = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
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
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    gap: 12,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Cairo_700Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    flex: 1,
    backgroundColor: 'transparent',
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
    borderRadius: 10,
    borderWidth: 2,
    gap: 6,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  optionIcon: {
    width: 16,
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: 'Cairo_700Bold',
    backgroundColor: 'transparent',
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  divider: {
    height: 2,
    marginVertical: 4,
    opacity: 0.15,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  logoutText: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#EF4444',
    backgroundColor: 'transparent',
  },
  version: {
    fontSize: 11,
    fontFamily: 'Cairo_600SemiBold',
    textAlign: 'center',
    marginTop: 4,
  },
});
