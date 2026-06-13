import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  Text,
  TouchableOpacity,
  BackHandler,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { AppScreen, ActiveTab, Goal, GoalPin, Task } from './src/types';
import { api } from './src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context
import { AppProvider, useAppSettings } from './src/context/AppContext';

// Screens
import { OnboardingScreen }  from './src/components/OnboardingScreen';
import { AuthScreen }        from './src/components/AuthScreen';
import { HomeScreen }        from './src/components/HomeScreen';
import { ChatScreen }        from './src/components/ChatScreen';
import { VisionBoardScreen } from './src/components/VisionBoardScreen';
import { JourneyMapScreen }  from './src/components/JourneyMapScreen';
import { ProgressScreen }    from './src/components/ProgressScreen';
import { SettingsScreen }    from './src/components/SettingsScreen';

// Custom Hand-Drawn Icons
import { HomeIcon, ChatIcon, VisionIcon, ProgressIcon } from './src/components/common/CustomIcons';
import { NotebookBackground } from './src/components/common/NotebookBackground';

// ─── Inner App (needs context to be mounted first) ────────────────────────────
interface TabBarItemProps {
  tabKey: ActiveTab;
  label: string;
  Icon: any;
  active: boolean;
  colors: any;
  onPress: (key: ActiveTab) => void;
  styles: any;
}

const TabBarItem = React.memo(({
  tabKey,
  label,
  Icon,
  active,
  colors,
  onPress,
  styles,
}: TabBarItemProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(tabKey)}
      delayPressIn={0}
      activeOpacity={0.7}
      style={[
        styles.tabItem,
        active ? {
          backgroundColor: colors.surfaceElevated,
          borderLeftWidth: 2.5,
          borderRightWidth: 2.5,
          borderTopWidth: 2.5,
          borderBottomWidth: 0,
          borderColor: colors.border,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          height: Platform.OS === 'ios' ? 92 : 74,
          paddingTop: 10,
          shadowColor: colors.border,
          shadowOffset: { width: 2, height: -2 },
          shadowOpacity: 0.12,
          shadowRadius: 2,
          elevation: 6,
          zIndex: 10,
        } : {
          height: Platform.OS === 'ios' ? 82 : 64,
        }
      ]}
    >
      <Icon size={22} color={active ? colors.accent : colors.textMuted} />
      <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.textMuted,
        fontFamily: active ? 'Cairo_700Bold' : 'Cairo_400Regular' }]}>
        {label}
      </Text>
      {active && <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />}
    </TouchableOpacity>
  );
});
TabBarItem.displayName = 'TabBarItem';

function AppInner() {
  const { colors, t, theme } = useAppSettings();

  const tabs = useMemo(
    () =>
      [
        { key: 'home',     label: t.nav_home,     Icon: HomeIcon },
        { key: 'chat',     label: t.nav_chat,     Icon: ChatIcon },
        { key: 'vision',   label: t.nav_vision,   Icon: VisionIcon },
        { key: 'progress', label: t.nav_progress, Icon: ProgressIcon },
      ] as { key: ActiveTab; label: string; Icon: any }[],
    [t]
  );

  const [fontsLoaded] = useFonts({ Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold });

  const [screen, setScreen]               = useState<AppScreen>('onboarding');
  const [activeTab, setActiveTab]         = useState<ActiveTab>('home');
  const [renderedTab, setRenderedTab]     = useState<ActiveTab>('home');
  const [token, setToken]                 = useState<string | null>(null);
  const [goals, setGoals]                 = useState<GoalPin[]>([]);
  const [activeGoal, setActiveGoal]       = useState<Goal | null>(null);
  const [tasks, setTasks]                 = useState<Task[]>([]);
  const [activeGoalId, setActiveGoalId]   = useState<string | null>(null);
  const [appReady, setAppReady]           = useState(false);
  const [selectedGoal, setSelectedGoal]   = useState<GoalPin | null>(null);
  const [settingsOpen, setSettingsOpen]   = useState(false);

  // preferredId: which goal to mark active; falls back to latest
  const fetchGoals = useCallback(async (preferredId?: string | null) => {
    try {
      const allGoals = await api.getGoals();
      setGoals(allGoals);
      if (allGoals.length > 0) {
        const pick = preferredId
          ? (allGoals.find(g => g.id === preferredId) ?? allGoals[allGoals.length - 1])
          : allGoals[allGoals.length - 1];
        setActiveGoal({ id: pick.id, text: pick.text });
        setTasks(pick.tasks);
      } else {
        setActiveGoal(null);
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedToken    = await api.getToken();
        if (storedToken) {
          setToken(storedToken);
          const savedActiveId = await AsyncStorage.getItem('anar_active_goal');
          setActiveGoalId(savedActiveId);
          await fetchGoals(savedActiveId);
          setScreen('main');
          setActiveTab('home');
          setRenderedTab('home');
        } else {
          setScreen('onboarding');
        }
      } catch (err) {
        console.error('App init error:', err);
      } finally {
        setAppReady(true);
      }
    };
    initializeApp();
  }, [fetchGoals]);

  // Android hardware back — close journey map or settings first
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (settingsOpen)         { setSettingsOpen(false); return true; }
      if (selectedGoal !== null){ setSelectedGoal(null);  return true; }
      return false;
    });
    return () => sub.remove();
  }, [selectedGoal, settingsOpen]);

  const handleFinishOnboarding = useCallback(async () => {
    setScreen('auth');
  }, []);

  const handleAuthSuccess = useCallback(async (newToken: string) => {
    setToken(newToken);
    const savedActiveId = await AsyncStorage.getItem('anar_active_goal');
    setActiveGoalId(savedActiveId);
    await fetchGoals(savedActiveId);
    setScreen('main');
    setActiveTab('home');
    setRenderedTab('home');
  }, [fetchGoals]);

  const handleSetActiveGoal = useCallback(async (id: string) => {
    setActiveGoalId(id);
    await AsyncStorage.setItem('anar_active_goal', id);
    await fetchGoals(id);
  }, [fetchGoals]);

  const handleLogout = useCallback(async () => {
    await api.logout();
    setToken(null);
    setGoals([]);
    setActiveGoal(null);
    setTasks([]);
    setSelectedGoal(null);
    setScreen('onboarding');
    setActiveTab('home');
    setRenderedTab('home');
  }, []);

  const handleGoalPress = useCallback((goal: GoalPin) => {
    setSelectedGoal(goal);
  }, []);

  const handleTabPress = useCallback((key: ActiveTab) => {
    setActiveTab(key);
    setRenderedTab(key);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleCloseJourney = useCallback(() => {
    setSelectedGoal(null);
  }, []);

  const handleRefreshJourneyGoals = useCallback(async () => {
    await fetchGoals();
    if (selectedGoal) {
      try {
        const all = await api.getGoals();
        const fresh = all.find((g) => g.id === selectedGoal.id);
        if (fresh) setSelectedGoal(fresh);
      } catch (err) {
        console.error(err);
      }
    }
  }, [fetchGoals, selectedGoal]);

  const handleRefreshGoals = useCallback(() => {
    fetchGoals(activeGoalId);
  }, [fetchGoals, activeGoalId]);

  if (!fontsLoaded || !appReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isJourneyOpen = selectedGoal !== null;

  // Safe area + status bar bg logic
  const safeAreaBg =
    isJourneyOpen              ? colors.bg
    : screen === 'main' && activeTab === 'vision' ? colors.corkHeader
    : screen === 'onboarding'  ? '#1E1D3B'
    : colors.bg;

  const statusBarStyle =
    isJourneyOpen             ? colors.statusBar
    : screen === 'onboarding' ? 'light'
    : colors.statusBar;

  const showNotebookBg = isJourneyOpen || !(screen === 'main' && activeTab === 'vision');

  return (
    <View style={[styles.container, { backgroundColor: safeAreaBg }]}>
      <StatusBar style={statusBarStyle} />

      {showNotebookBg && (
        <>
          <NotebookBackground />
          <View style={[styles.bgPurple, { backgroundColor: colors.accent }]} />
          <View style={[styles.bgTeal, { backgroundColor: colors.accentAlt }]} />
        </>
      )}

      {screen === 'onboarding' && <OnboardingScreen onFinish={handleFinishOnboarding} />}
      {screen === 'auth'       && <AuthScreen onAuthSuccess={handleAuthSuccess} />}

      {screen === 'main' && (
        <View style={{ flex: 1 }}>
          {isJourneyOpen ? (
            /* ── Journey Map fullscreen ── */
            <JourneyMapScreen
              goal={selectedGoal!}
              onBack={handleCloseJourney}
              refreshGoals={handleRefreshJourneyGoals}
            />
          ) : (
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, display: renderedTab === 'home' ? 'flex' : 'none' }}>
                  <HomeScreen
                    active={renderedTab === 'home'}
                    onNavigate={handleTabPress}
                    activeGoal={activeGoal}
                    tasks={tasks}
                    onLogout={handleLogout}
                    onOpenSettings={handleOpenSettings}
                  />
                </View>
                <View style={{ flex: 1, display: renderedTab === 'chat' ? 'flex' : 'none' }}>
                  <ChatScreen
                    active={renderedTab === 'chat'}
                    onNavigate={handleTabPress}
                    refreshGoal={fetchGoals}
                  />
                </View>
                <View style={{ flex: 1, display: renderedTab === 'vision' ? 'flex' : 'none' }}>
                  <VisionBoardScreen
                    active={renderedTab === 'vision'}
                    onNavigate={handleTabPress}
                    goals={goals}
                    activeGoalId={activeGoalId}
                    onGoalPress={handleGoalPress}
                    onSetActiveGoal={handleSetActiveGoal}
                    refreshGoals={handleRefreshGoals}
                  />
                </View>
                <View style={{ flex: 1, display: renderedTab === 'progress' ? 'flex' : 'none' }}>
                  <ProgressScreen
                    active={renderedTab === 'progress'}
                    goals={goals}
                    tasks={tasks}
                  />
                </View>
              </View>

              <View style={[styles.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.border }]} pointerEvents="box-none">
                {tabs.map(({ key, label, Icon }) => (
                  <TabBarItem
                    key={key}
                    tabKey={key}
                    label={label}
                    Icon={Icon}
                    active={activeTab === key}
                    colors={colors}
                    onPress={handleTabPress}
                    styles={styles}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── Settings Modal ── */}
      <Modal
        visible={settingsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={styles.settingsOverlay}>
          <TouchableOpacity
            style={styles.settingsDismiss}
            onPress={() => setSettingsOpen(false)}
            activeOpacity={1}
          />
          <View style={[styles.settingsSheet, { backgroundColor: colors.bg }]}>
            <View style={[styles.settingsHandle, { backgroundColor: colors.border }]} />
            <SettingsScreen
              onClose={() => setSettingsOpen(false)}
              onLogout={handleLogout}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Root (wraps AppInner with AppProvider) ───────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  bgPurple: {
    position: 'absolute',
    top: -80, right: -60,
    width: 280, height: 280, borderRadius: 140,
    opacity: 0.12,
  },
  bgTeal: {
    position: 'absolute',
    bottom: 160, left: -80,
    width: 240, height: 240, borderRadius: 120,
    opacity: 0.08,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 82 : 64,
    borderTopWidth: 3,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  settingsDismiss: {
    flex: 1,
  },
  settingsSheet: {
    height: '75%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  settingsHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
});
