import React, { useState, useEffect } from 'react';
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

// Icons (4 tabs)
import { Home, MessageSquare, Sparkles, BarChart2 } from 'lucide-react-native';

// ─── Inner App (needs context to be mounted first) ────────────────────────────
function AppInner() {
  const { colors, t, theme } = useAppSettings();

  const [fontsLoaded] = useFonts({ Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold });

  const [screen, setScreen]               = useState<AppScreen>('onboarding');
  const [activeTab, setActiveTab]         = useState<ActiveTab>('home');
  const [token, setToken]                 = useState<string | null>(null);
  const [goals, setGoals]                 = useState<GoalPin[]>([]);
  const [activeGoal, setActiveGoal]       = useState<Goal | null>(null);
  const [tasks, setTasks]                 = useState<Task[]>([]);
  const [activeGoalId, setActiveGoalId]   = useState<string | null>(null);
  const [appReady, setAppReady]           = useState(false);
  const [selectedGoal, setSelectedGoal]   = useState<GoalPin | null>(null);
  const [settingsOpen, setSettingsOpen]   = useState(false);

  // preferredId: which goal to mark active; falls back to latest
  const fetchGoals = async (preferredId?: string | null) => {
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
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem('onboarding_done');
        const storedToken    = await api.getToken();
        if (storedToken) {
          setToken(storedToken);
          const savedActiveId = await AsyncStorage.getItem('anar_active_goal');
          setActiveGoalId(savedActiveId);
          await fetchGoals(savedActiveId);
          setScreen('main');
          setActiveTab('home');
        } else if (onboardingDone === 'true') {
          setScreen('auth');
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
  }, []);

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

  const handleFinishOnboarding = async () => {
    try { await AsyncStorage.setItem('onboarding_done', 'true'); } catch {}
    setScreen('auth');
  };

  const handleAuthSuccess = async (newToken: string) => {
    setToken(newToken);
    const savedActiveId = await AsyncStorage.getItem('anar_active_goal');
    setActiveGoalId(savedActiveId);
    await fetchGoals(savedActiveId);
    setScreen('main');
    setActiveTab('home');
  };

  const handleSetActiveGoal = async (id: string) => {
    setActiveGoalId(id);
    await AsyncStorage.setItem('anar_active_goal', id);
    await fetchGoals(id);
  };

  const handleLogout = async () => {
    await api.logout();
    setToken(null);
    setGoals([]);
    setActiveGoal(null);
    setTasks([]);
    setSelectedGoal(null);
    setScreen('auth');
  };

  const handleGoalPress = (goal: GoalPin) => {
    const fresh = goals.find((g) => g.id === goal.id) ?? goal;
    setSelectedGoal(fresh);
  };

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
    isJourneyOpen              ? '#0F0E2A'
    : screen === 'main' && activeTab === 'vision' ? colors.corkHeader
    : screen === 'onboarding'  ? '#1E1D3B'
    : colors.bg;

  const statusBarStyle =
    isJourneyOpen             ? 'light'
    : screen === 'onboarding' ? 'light'
    : colors.statusBar;

  const renderActiveTabScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={setActiveTab}
            activeGoal={activeGoal}
            tasks={tasks}
            onLogout={handleLogout}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        );
      case 'chat':
        return <ChatScreen onNavigate={setActiveTab} refreshGoal={fetchGoals} />;
      case 'vision':
        return (
          <VisionBoardScreen
            onNavigate={setActiveTab}
            goals={goals}
            activeGoalId={activeGoalId}
            onGoalPress={handleGoalPress}
            onSetActiveGoal={handleSetActiveGoal}
            refreshGoals={() => fetchGoals(activeGoalId)}
          />
        );
      case 'progress':
        return <ProgressScreen goals={goals} tasks={tasks} />;
      default:
        return (
          <HomeScreen
            onNavigate={setActiveTab}
            activeGoal={activeGoal}
            tasks={tasks}
            onLogout={handleLogout}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeAreaBg }]}>
      <StatusBar style={statusBarStyle} />

      {screen === 'onboarding' && <OnboardingScreen onFinish={handleFinishOnboarding} />}
      {screen === 'auth'       && <AuthScreen onAuthSuccess={handleAuthSuccess} />}

      {screen === 'main' && (
        <View style={{ flex: 1 }}>
          {isJourneyOpen ? (
            /* ── Journey Map fullscreen ── */
            <JourneyMapScreen
              goal={selectedGoal!}
              onBack={() => setSelectedGoal(null)}
              refreshGoals={async () => {
                await fetchGoals();
                const fresh = (await api.getGoals()).find((g) => g.id === selectedGoal!.id);
                if (fresh) setSelectedGoal(fresh);
              }}
            />
          ) : (
            /* ── Normal tab navigation ── */
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={{ flex: 1 }}>
                {renderActiveTabScreen()}
              </View>

              {/* ── Tab Bar ── */}
              <View style={[styles.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder }]}>
                {(
                  [
                    { key: 'home',     label: t.nav_home,     Icon: Home           },
                    { key: 'chat',     label: t.nav_chat,     Icon: MessageSquare  },
                    { key: 'vision',   label: t.nav_vision,   Icon: Sparkles       },
                    { key: 'progress', label: t.nav_progress, Icon: BarChart2      },
                  ] as { key: ActiveTab; label: string; Icon: any }[]
                ).map(({ key, label, Icon }) => {
                  const active = activeTab === key;
                  return (
                    <TouchableOpacity key={key} onPress={() => setActiveTab(key)} style={styles.tabItem}>
                      <Icon size={22} color={active ? colors.accentAlt : colors.textMuted} />
                      <Text style={[styles.tabLabel, { color: active ? colors.accentAlt : colors.textMuted,
                        fontFamily: active ? 'Cairo_700Bold' : 'Cairo_400Regular' }]}>
                        {label}
                      </Text>
                      {active && <View style={[styles.activeDot, { backgroundColor: colors.accentAlt }]} />}
                    </TouchableOpacity>
                  );
                })}
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
    </SafeAreaView>
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
    height: 70,
    borderTopWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
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
