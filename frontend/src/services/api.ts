import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Goal, GoalPin, JourneyStage, Task } from '../types';

// Card visual variety — cycles as user creates more goals
const CARD_COLORS = ['#FFF9E6', '#F0F4FF', '#FFF0EF', '#F0FDF4', '#FFFBEB', '#F5F0FF'];
const PIN_COLORS = ['#EF4444', '#6C5CE7', '#F59E0B', '#00BFA6', '#3B82F6', '#A855F7'];
const ROTATIONS = [2.5, -2, 3, -1.5, 2, -3];

// ─── API ─────────────────────────────────────────────────────────────────────
const getBackendIp = (): string => {
  if (Platform.OS === 'web') return 'localhost';
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) return ip;
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const BACKEND_IP = getBackendIp();

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
  stages?: any[];
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

  async signup(email: string, password: string): Promise<{ token: string }> {
    const res = await request<AuthResponse>(3001, '/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.setToken(res.token);
    await AsyncStorage.setItem('mock_user_email', res.email);
    return { token: res.token };
  },

  async login(email: string, password: string): Promise<{ token: string }> {
    const res = await request<AuthResponse>(3001, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.setToken(res.token);
    await AsyncStorage.setItem('mock_user_email', res.email);
    return { token: res.token };
  },

  async logout(): Promise<void> {
    await this.setToken(null);
    await AsyncStorage.removeItem('mock_user_email');
  },

  async getGoals(): Promise<GoalPin[]> {
    const goals = await request<BackendGoal[]>(3002, '/goal/all', {
      method: 'GET',
    });
    if (!goals || goals.length === 0) return [];

    return goals.map((goal, index) => {
      const stages = Array.isArray(goal.stages) ? goal.stages : [];
      const emoji = stages.length > 0 && stages[0].emoji ? stages[0].emoji : '🎯';
      return {
        id: goal.id,
        text: goal.text,
        emoji,
        color: CARD_COLORS[index % CARD_COLORS.length],
        pinColor: PIN_COLORS[index % PIN_COLORS.length],
        rotation: ROTATIONS[index % ROTATIONS.length],
        createdAt: new Date().toISOString(),
        tasks: goal.tasks.map((t) => ({
          id: t.id,
          goal_id: t.goal_id,
          text: t.text,
          completed: t.completed,
          order_index: t.order_index,
          completed_at: t.completed_at,
        })),
        stages,
      };
    });
  },

  async getGoal(): Promise<(Goal & { tasks: Task[]; stages?: any[] }) | null> {
    const goal = await request<BackendGoal | null>(3002, '/goal', {
      method: 'GET',
    });
    if (!goal) return null;

    return {
      id: goal.id,
      text: goal.text,
      stages: Array.isArray(goal.stages) ? goal.stages : [],
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

  async createGoal(goalText: string): Promise<GoalPin> {
    const goal = await request<BackendGoal>(3002, '/goal', {
      method: 'POST',
      body: JSON.stringify({ goalText }),
    });

    const stages = Array.isArray(goal.stages) ? goal.stages : [];
    const emoji = stages.length > 0 && stages[0].emoji ? stages[0].emoji : '🎯';

    return {
      id: goal.id,
      text: goal.text,
      emoji,
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
      stages,
    };
  },

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

  async chatWithAi(messages: Array<{ role: string; content: string }>, lang: string): Promise<{ response_ar: string; suggestedGoal: string | null }> {
    return request<{ response_ar: string; suggestedGoal: string | null }>(3002, '/goal/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, lang }),
    });
  },

  async saveChatMessage(role: string, content: string): Promise<void> {
    await request<void>(3002, '/goal/chat/message', {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    });
  },

  async getChatHistory(): Promise<Array<{ role: string; content: string }>> {
    return request<Array<{ role: string; content: string }>>(3002, '/goal/chat/history', {
      method: 'GET',
    });
  },
};

