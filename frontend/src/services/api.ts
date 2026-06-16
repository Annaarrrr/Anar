import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Goal, GoalPin, JourneyStage, Task } from '../types';

// ─── Stage Generator ────────────────────────────────────────────────────────
function generateStages(goalText: string): JourneyStage[] {
  const t = goalText.toLowerCase();

  if (t.includes('برمج') || t.includes('كود') || t.includes('بايثون') || t.includes('تطوير') || t.includes('web') || t.includes('code')) {
    return [
      { id: 's0', label: 'مقدمة في البرمجة', sublabel: 'مفاهيم أساسية', emoji: '💡' },
      { id: 's1', label: 'أساسيات بايثون', sublabel: 'المتغيرات والشروط', emoji: '🐍' },
      { id: 's2', label: 'هياكل البيانات', sublabel: 'Lists · Dicts · Sets', emoji: '⚡' },
      { id: 's3', label: 'مشاريع تطبيقية', sublabel: 'مشاريع حقيقية', emoji: '🛠️' },
      { id: 's4', label: 'مكتبات متقدمة', sublabel: 'Pandas · NumPy · AI', emoji: '🚀' },
    ];
  }

  if (t.includes('رياض') || t.includes('لياقة') || t.includes('وزن') || t.includes('صحة') || t.includes('تمرين') || t.includes('فتنس')) {
    return [
      { id: 's0', label: 'البداية والتحضير', sublabel: 'فهم الجسم والأهداف', emoji: '🌱' },
      { id: 's1', label: 'تمارين الكارديو', sublabel: 'حرق الدهون', emoji: '🏃' },
      { id: 's2', label: 'تمارين القوة', sublabel: 'بناء العضلات', emoji: '💪' },
      { id: 's3', label: 'التغذية السليمة', sublabel: 'خطة الأكل الصحي', emoji: '🥗' },
      { id: 's4', label: 'اللياقة المتقدمة', sublabel: 'روتين احترافي', emoji: '🏆' },
    ];
  }

  if (t.includes('قراء') || t.includes('كتاب') || t.includes('رواية')) {
    return [
      { id: 's0', label: 'اختيار الكتب', sublabel: 'قائمة القراءة', emoji: '📋' },
      { id: 's1', label: 'القراءة اليومية', sublabel: '20 دقيقة يومياً', emoji: '📖' },
      { id: 's2', label: 'التدوين والملاحظات', sublabel: 'تسجيل الأفكار', emoji: '✏️' },
      { id: 's3', label: 'المراجعة والتلخيص', sublabel: 'تعميق الفهم', emoji: '🔍' },
      { id: 's4', label: 'شارك ما تعلمت', sublabel: 'التطبيق الفعلي', emoji: '🌟' },
    ];
  }

  if (t.includes('درس') || t.includes('مذاكر') || t.includes('امتحان') || t.includes('جامعة') || t.includes('أكاديم')) {
    return [
      { id: 's0', label: 'خطة المراجعة', sublabel: 'تنظيم الوقت', emoji: '📅' },
      { id: 's1', label: 'أساسيات المادة', sublabel: 'فهم المفاهيم', emoji: '📚' },
      { id: 's2', label: 'الفهم العميق', sublabel: 'ربط المعلومات', emoji: '🧠' },
      { id: 's3', label: 'التدريب والتمارين', sublabel: 'حل المسائل', emoji: '✍️' },
      { id: 's4', label: 'الاختبار التجريبي', sublabel: 'محاكاة الامتحان', emoji: '🎯' },
    ];
  }

  if (t.includes('لغة') || t.includes('إنجليز') || t.includes('english') || t.includes('تحدث')) {
    return [
      { id: 's0', label: 'الأبجدية والنطق', sublabel: 'أصوات اللغة', emoji: '🔤' },
      { id: 's1', label: 'كلمات أساسية', sublabel: 'قاموس اليومي', emoji: '💬' },
      { id: 's2', label: 'جمل بسيطة', sublabel: 'التعبير الأساسي', emoji: '📝' },
      { id: 's3', label: 'المحادثة', sublabel: 'التفاعل اليومي', emoji: '🗣️' },
      { id: 's4', label: 'الطلاقة', sublabel: 'إتقان اللغة', emoji: '🌍' },
    ];
  }

  if (t.includes('تنظيم') || t.includes('وقت') || t.includes('جدول') || t.includes('نوم') || t.includes('إدارة')) {
    return [
      { id: 's0', label: 'تحليل الوقت', sublabel: 'أين يذهب وقتك؟', emoji: '🔍' },
      { id: 's1', label: 'تحديد الأولويات', sublabel: 'ما الأهم؟', emoji: '⭐' },
      { id: 's2', label: 'بناء الجدول', sublabel: 'روتين اليوم', emoji: '📅' },
      { id: 's3', label: 'التنفيذ الفعلي', sublabel: 'الالتزام اليومي', emoji: '✅' },
      { id: 's4', label: 'العادات الدائمة', sublabel: 'انضباط حقيقي', emoji: '🏆' },
    ];
  }

  // Default / generic
  return [
    { id: 's0', label: 'التخطيط', sublabel: 'رسم خريطة الطريق', emoji: '🗺️' },
    { id: 's1', label: 'الأساسيات', sublabel: 'بناء القاعدة', emoji: '🏗️' },
    { id: 's2', label: 'التنفيذ', sublabel: 'الخطوات الفعلية', emoji: '⚙️' },
    { id: 's3', label: 'التقدم', sublabel: 'قياس النجاح', emoji: '📈' },
    { id: 's4', label: 'الإتقان', sublabel: 'بلوغ الهدف', emoji: '🏆' },
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
const PIN_COLORS = ['#EF4444', '#6C5CE7', '#F59E0B', '#00BFA6', '#3B82F6', '#A855F7'];
const ROTATIONS = [2.5, -2, 3, -1.5, 2, -3];

// ─── API ─────────────────────────────────────────────────────────────────────
// Dynamically resolves IP based on environment: 'localhost' for web/iOS, '10.0.2.2' for Android Emulator.
const BACKEND_IP = Platform.OS === 'web'
  ? 'localhost'
  : Platform.OS === 'android'
    ? '10.0.2.2'
    : 'localhost';

async function request<T>(port: number, path: string, options: RequestInit = {}): Promise<T> {
  const token = await api.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `http://${BACKEND_IP}:${port}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Request failed';
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || message;
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

let cachedToken: string | null = null;

interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  expiresAt: string;
}

interface BackendGoal {
  id: string;
  user_id: string;
  text: string;
  tasks: Array<{
    id: string;
    goal_id: string;
    text: string;
    completed: boolean;
    order_index: number;
    completed_at: string | null;
  }>;
}

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

  async getUserId(): Promise<string | null> {
    return await AsyncStorage.getItem('mock_user_id');
  },

  async signup(email: string, password: string): Promise<{ token: string }> {
    const res = await request<AuthResponse>(3001, '/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.setToken(res.token);
    await AsyncStorage.setItem('mock_user_email', res.email);
    await AsyncStorage.setItem('mock_user_id', res.userId);
    return { token: res.token };
  },

  async login(email: string, password: string): Promise<{ token: string }> {
    const res = await request<AuthResponse>(3001, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.setToken(res.token);
    await AsyncStorage.setItem('mock_user_email', res.email);
    await AsyncStorage.setItem('mock_user_id', res.userId);
    return { token: res.token };
  },

  async logout(): Promise<void> {
    await this.setToken(null);
    await AsyncStorage.removeItem('mock_user_email');
    await AsyncStorage.removeItem('mock_user_id');
  },


  // ── All goals ──────────────────────────────────────────────────────────────
  async getGoals(): Promise<GoalPin[]> {
    const goal = await request<BackendGoal | null>(3002, '/goal', {
      method: 'GET',
    });
    if (!goal) return [];

    const pin: GoalPin = {
      id: goal.id,
      text: goal.text,
      emoji: getGoalEmoji(goal.text),
      color: CARD_COLORS[0],
      pinColor: PIN_COLORS[0],
      rotation: ROTATIONS[0],
      createdAt: new Date().toISOString(),
      tasks: goal.tasks.map((t) => ({
        id: t.id,
        goal_id: t.goal_id,
        text: t.text,
        completed: t.completed,
        order_index: t.order_index,
        completed_at: t.completed_at,
      })),
      stages: generateStages(goal.text),
    };
    return [pin];
  },

  // ── Latest goal — used by Home + Progress screens ─────────────────────────
  async getGoal(): Promise<(Goal & { tasks: Task[] }) | null> {
    const goal = await request<BackendGoal | null>(3002, '/goal', {
      method: 'GET',
    });
    if (!goal) return null;

    return {
      id: goal.id,
      text: goal.text,
      tasks: goal.tasks.map((t) => ({
        id: t.id,
        goal_id: t.goal_id,
        text: t.text,
        completed: t.completed,
        order_index: t.order_index,
        completed_at: t.completed_at,
      })),
    };
  },

  // ── Create a new goal pin ─────────────────────────────────────────────────
  async createGoal(goalText: string): Promise<GoalPin> {
    const goal = await request<BackendGoal>(3002, '/goal', {
      method: 'POST',
      body: JSON.stringify({ goalText }),
    });

    const pin: GoalPin = {
      id: goal.id,
      text: goal.text,
      emoji: getGoalEmoji(goal.text),
      color: CARD_COLORS[0],
      pinColor: PIN_COLORS[0],
      rotation: ROTATIONS[0],
      createdAt: new Date().toISOString(),
      tasks: goal.tasks.map((t) => ({
        id: t.id,
        goal_id: t.goal_id,
        text: t.text,
        completed: t.completed,
        order_index: t.order_index,
        completed_at: t.completed_at,
      })),
      stages: generateStages(goal.text),
    };
    return pin;
  },

  // ── Toggle a task in any goal ─────────────────────────────────────────────
  async toggleTask(taskId: string, completed: boolean): Promise<void> {
    await request<void>(3003, `/task/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  async updateGoal(goalId: string, newText: string): Promise<void> {
    await request<void>(3002, `/goal/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ goalText: newText }),
    });
  },

  async deleteGoal(goalId: string): Promise<void> {
    await request<void>(3002, `/goal/${goalId}`, {
      method: 'DELETE',
    });
  },

  async registerPushToken(userId: string, token: string): Promise<void> {
    await request<void>(3001, `/users/${userId}/tokens`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};


