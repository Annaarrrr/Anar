import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, GoalPin, JourneyStage, Task } from '../types';

// ─── Stage Generator ────────────────────────────────────────────────────────
function generateStages(goalText: string): JourneyStage[] {
  const t = goalText.toLowerCase();

  if (t.includes('برمج') || t.includes('كود') || t.includes('بايثون') || t.includes('تطوير') || t.includes('web') || t.includes('code')) {
    return [
      { id: 's0', label: 'مقدمة في البرمجة',   sublabel: 'مفاهيم أساسية',        emoji: '💡' },
      { id: 's1', label: 'أساسيات بايثون',      sublabel: 'المتغيرات والشروط',    emoji: '🐍' },
      { id: 's2', label: 'هياكل البيانات',       sublabel: 'Lists · Dicts · Sets', emoji: '⚡' },
      { id: 's3', label: 'مشاريع تطبيقية',      sublabel: 'مشاريع حقيقية',        emoji: '🛠️' },
      { id: 's4', label: 'مكتبات متقدمة',       sublabel: 'Pandas · NumPy · AI',  emoji: '🚀' },
    ];
  }

  if (t.includes('رياض') || t.includes('لياقة') || t.includes('وزن') || t.includes('صحة') || t.includes('تمرين') || t.includes('فتنس')) {
    return [
      { id: 's0', label: 'البداية والتحضير',    sublabel: 'فهم الجسم والأهداف',  emoji: '🌱' },
      { id: 's1', label: 'تمارين الكارديو',      sublabel: 'حرق الدهون',           emoji: '🏃' },
      { id: 's2', label: 'تمارين القوة',         sublabel: 'بناء العضلات',         emoji: '💪' },
      { id: 's3', label: 'التغذية السليمة',      sublabel: 'خطة الأكل الصحي',     emoji: '🥗' },
      { id: 's4', label: 'اللياقة المتقدمة',     sublabel: 'روتين احترافي',        emoji: '🏆' },
    ];
  }

  if (t.includes('قراء') || t.includes('كتاب') || t.includes('رواية')) {
    return [
      { id: 's0', label: 'اختيار الكتب',        sublabel: 'قائمة القراءة',        emoji: '📋' },
      { id: 's1', label: 'القراءة اليومية',      sublabel: '20 دقيقة يومياً',      emoji: '📖' },
      { id: 's2', label: 'التدوين والملاحظات',   sublabel: 'تسجيل الأفكار',        emoji: '✏️' },
      { id: 's3', label: 'المراجعة والتلخيص',    sublabel: 'تعميق الفهم',          emoji: '🔍' },
      { id: 's4', label: 'شارك ما تعلمت',        sublabel: 'التطبيق الفعلي',       emoji: '🌟' },
    ];
  }

  if (t.includes('درس') || t.includes('مذاكر') || t.includes('امتحان') || t.includes('جامعة') || t.includes('أكاديم')) {
    return [
      { id: 's0', label: 'خطة المراجعة',         sublabel: 'تنظيم الوقت',          emoji: '📅' },
      { id: 's1', label: 'أساسيات المادة',        sublabel: 'فهم المفاهيم',         emoji: '📚' },
      { id: 's2', label: 'الفهم العميق',          sublabel: 'ربط المعلومات',        emoji: '🧠' },
      { id: 's3', label: 'التدريب والتمارين',     sublabel: 'حل المسائل',           emoji: '✍️' },
      { id: 's4', label: 'الاختبار التجريبي',     sublabel: 'محاكاة الامتحان',      emoji: '🎯' },
    ];
  }

  if (t.includes('لغة') || t.includes('إنجليز') || t.includes('english') || t.includes('تحدث')) {
    return [
      { id: 's0', label: 'الأبجدية والنطق',      sublabel: 'أصوات اللغة',          emoji: '🔤' },
      { id: 's1', label: 'كلمات أساسية',          sublabel: 'قاموس اليومي',         emoji: '💬' },
      { id: 's2', label: 'جمل بسيطة',             sublabel: 'التعبير الأساسي',      emoji: '📝' },
      { id: 's3', label: 'المحادثة',              sublabel: 'التفاعل اليومي',       emoji: '🗣️' },
      { id: 's4', label: 'الطلاقة',               sublabel: 'إتقان اللغة',          emoji: '🌍' },
    ];
  }

  if (t.includes('تنظيم') || t.includes('وقت') || t.includes('جدول') || t.includes('نوم') || t.includes('إدارة')) {
    return [
      { id: 's0', label: 'تحليل الوقت',           sublabel: 'أين يذهب وقتك؟',      emoji: '🔍' },
      { id: 's1', label: 'تحديد الأولويات',       sublabel: 'ما الأهم؟',            emoji: '⭐' },
      { id: 's2', label: 'بناء الجدول',            sublabel: 'روتين اليوم',          emoji: '📅' },
      { id: 's3', label: 'التنفيذ الفعلي',         sublabel: 'الالتزام اليومي',      emoji: '✅' },
      { id: 's4', label: 'العادات الدائمة',        sublabel: 'انضباط حقيقي',         emoji: '🏆' },
    ];
  }

  // Default / generic
  return [
    { id: 's0', label: 'التخطيط',                sublabel: 'رسم خريطة الطريق',     emoji: '🗺️' },
    { id: 's1', label: 'الأساسيات',              sublabel: 'بناء القاعدة',          emoji: '🏗️' },
    { id: 's2', label: 'التنفيذ',                sublabel: 'الخطوات الفعلية',       emoji: '⚙️' },
    { id: 's3', label: 'التقدم',                 sublabel: 'قياس النجاح',           emoji: '📈' },
    { id: 's4', label: 'الإتقان',                sublabel: 'بلوغ الهدف',            emoji: '🏆' },
  ];
}

function getGoalEmoji(goalText: string): string {
  const t = goalText.toLowerCase();
  if (t.includes('برمج') || t.includes('كود') || t.includes('بايثون') || t.includes('تطوير')) return '💻';
  if (t.includes('رياض') || t.includes('لياقة') || t.includes('وزن')) return '🏃';
  if (t.includes('قراء') || t.includes('كتاب')) return '📚';
  if (t.includes('درس') || t.includes('مذاكر') || t.includes('امتحان')) return '🎓';
  if (t.includes('لغة') || t.includes('إنجليز')) return '🌍';
  if (t.includes('تنظيم') || t.includes('وقت') || t.includes('جدول')) return '⏰';
  return '🎯';
}

// Card visual variety — cycles as user creates more goals
const CARD_COLORS = ['#FFF9E6', '#F0F4FF', '#FFF0EF', '#F0FDF4', '#FFFBEB', '#F5F0FF'];
const PIN_COLORS  = ['#EF4444', '#6C5CE7', '#F59E0B', '#00BFA6', '#3B82F6', '#A855F7'];
const ROTATIONS   = [2.5, -2, 3, -1.5, 2, -3];

// ─── API ─────────────────────────────────────────────────────────────────────
let cachedToken: string | null = null;

export const api = {
  async setToken(token: string | null): Promise<void> {
    cachedToken = token;
    if (token) {
      await AsyncStorage.setItem('anar_token', token);
    } else {
      await AsyncStorage.removeItem('anar_token');
    }
  },

  async getToken(): Promise<string | null> {
    if (cachedToken) return cachedToken;
    cachedToken = await AsyncStorage.getItem('anar_token');
    return cachedToken;
  },

  async signup(email: string, _: string): Promise<{ token: string }> {
    const token = 'mock_jwt_' + Math.random().toString(36).substring(7);
    await this.setToken(token);
    await AsyncStorage.setItem('mock_user_email', email);
    return { token };
  },

  async login(email: string, _: string): Promise<{ token: string }> {
    const token = 'mock_jwt_' + Math.random().toString(36).substring(7);
    await this.setToken(token);
    await AsyncStorage.setItem('mock_user_email', email);
    return { token };
  },

  async logout(): Promise<void> {
    await this.setToken(null);
    await AsyncStorage.multiRemove([
      'anar_goals',
      'mock_user_email',
      'mock_goal',    // legacy
      'mock_tasks',   // legacy
    ]);
  },

  // ── All goals ──────────────────────────────────────────────────────────────
  async getGoals(): Promise<GoalPin[]> {
    const json = await AsyncStorage.getItem('anar_goals');
    if (!json) {
      // Migrate legacy single-goal storage
      const legacyGoalJson = await AsyncStorage.getItem('mock_goal');
      const legacyTasksJson = await AsyncStorage.getItem('mock_tasks');
      if (legacyGoalJson) {
        const legacyGoal = JSON.parse(legacyGoalJson) as Goal;
        const legacyTasks = legacyTasksJson ? (JSON.parse(legacyTasksJson) as Task[]) : [];
        const pin: GoalPin = {
          id: legacyGoal.id,
          text: legacyGoal.text,
          emoji: getGoalEmoji(legacyGoal.text),
          color: CARD_COLORS[0],
          pinColor: PIN_COLORS[0],
          rotation: ROTATIONS[0],
          createdAt: new Date().toISOString(),
          tasks: legacyTasks,
          stages: generateStages(legacyGoal.text),
        };
        await AsyncStorage.setItem('anar_goals', JSON.stringify([pin]));
        return [pin];
      }
      return [];
    }
    return JSON.parse(json) as GoalPin[];
  },

  // ── Latest goal — used by Home + Progress screens ─────────────────────────
  async getGoal(): Promise<(Goal & { tasks: Task[] }) | null> {
    const goals = await this.getGoals();
    if (goals.length === 0) return null;
    const latest = goals[goals.length - 1];
    return { id: latest.id, text: latest.text, tasks: latest.tasks };
  },

  // ── Create a new goal pin ─────────────────────────────────────────────────
  async createGoal(goalText: string): Promise<GoalPin> {
    const goals = await this.getGoals();
    const idx = goals.length % CARD_COLORS.length;
    const goalId = 'goal_' + Math.random().toString(36).substring(7);

    const tasks: Task[] = [
      { id: `${goalId}_t1`, goal_id: goalId, text: 'تحديد خطة العمل والجدول الزمني', completed: false },
      { id: `${goalId}_t2`, goal_id: goalId, text: 'مراجعة الأساسيات والمتطلبات الأولية', completed: false },
      { id: `${goalId}_t3`, goal_id: goalId, text: 'البدء بالتنفيذ الفعلي للخطوة الأولى', completed: false },
      { id: `${goalId}_t4`, goal_id: goalId, text: 'حل التمارين ومراجعة الأخطاء', completed: false },
      { id: `${goalId}_t5`, goal_id: goalId, text: 'قياس التقدم وتعديل الخطة للأسبوع المقبل', completed: false },
    ];

    const newPin: GoalPin = {
      id: goalId,
      text: goalText,
      emoji: getGoalEmoji(goalText),
      color: CARD_COLORS[idx],
      pinColor: PIN_COLORS[idx],
      rotation: ROTATIONS[idx],
      createdAt: new Date().toISOString(),
      tasks,
      stages: generateStages(goalText),
    };

    const updated = [...goals, newPin];
    await AsyncStorage.setItem('anar_goals', JSON.stringify(updated));

    // Keep legacy keys in sync so Home/Progress screens still work
    await AsyncStorage.setItem('mock_goal', JSON.stringify({ id: goalId, text: goalText }));
    await AsyncStorage.setItem('mock_tasks', JSON.stringify(tasks));

    return newPin;
  },

  // ── Toggle a task in any goal ─────────────────────────────────────────────
  async toggleTask(taskId: string, completed: boolean): Promise<void> {
    const goals = await this.getGoals();
    const updatedGoals = goals.map((g) => ({
      ...g,
      tasks: g.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      ),
    }));
    await AsyncStorage.setItem('anar_goals', JSON.stringify(updatedGoals));

    // Legacy sync
    const tasksJson = await AsyncStorage.getItem('mock_tasks');
    if (tasksJson) {
      const tasks = JSON.parse(tasksJson) as Task[];
      const updatedTasks = tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
          : t
      );
      await AsyncStorage.setItem('mock_tasks', JSON.stringify(updatedTasks));
    }
  },

  async updateGoal(goalId: string, newText: string): Promise<void> {
    const goals = await this.getGoals();
    const updatedGoals = goals.map((g) =>
      g.id === goalId ? { ...g, text: newText } : g
    );
    await AsyncStorage.setItem('anar_goals', JSON.stringify(updatedGoals));

    // Update legacy key if it matches the edited goal
    const legacyGoalJson = await AsyncStorage.getItem('mock_goal');
    if (legacyGoalJson) {
      const legacyGoal = JSON.parse(legacyGoalJson) as Goal;
      if (legacyGoal.id === goalId) {
        await AsyncStorage.setItem('mock_goal', JSON.stringify({ id: goalId, text: newText }));
      }
    }
  },

  async deleteGoal(goalId: string): Promise<void> {
    const goals = await this.getGoals();
    const updatedGoals = goals.filter((g) => g.id !== goalId);
    await AsyncStorage.setItem('anar_goals', JSON.stringify(updatedGoals));

    // Fallback active goal logic if we deleted the current active goal
    const activeId = await AsyncStorage.getItem('anar_active_goal');
    if (activeId === goalId) {
      if (updatedGoals.length > 0) {
        const nextActiveId = updatedGoals[updatedGoals.length - 1].id;
        await AsyncStorage.setItem('anar_active_goal', nextActiveId);
      } else {
        await AsyncStorage.removeItem('anar_active_goal');
      }
    }

    // Clean up legacy keys if they matched this goal
    const legacyGoalJson = await AsyncStorage.getItem('mock_goal');
    if (legacyGoalJson) {
      const legacyGoal = JSON.parse(legacyGoalJson) as Goal;
      if (legacyGoal.id === goalId) {
        await AsyncStorage.removeItem('mock_goal');
        await AsyncStorage.removeItem('mock_tasks');
      }
    }
  },
};
