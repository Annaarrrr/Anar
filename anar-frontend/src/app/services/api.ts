const AUTH_BASE = "http://localhost:3001";
const GOAL_BASE = "http://localhost:3002";
const TASK_BASE = "http://localhost:3003";

let authToken = localStorage.getItem("anar_token") || null;

export const api = {
  setToken(token: string | null) {
    authToken = token;
    if (token) {
      localStorage.setItem("anar_token", token);
    } else {
      localStorage.removeItem("anar_token");
    }
  },

  getToken() {
    return authToken;
  },

  async request(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = "حدث خطأ ما";
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    if (response.status === 204) return null;

    try {
      return await response.json();
    } catch {
      return null;
    }
  },

  async signup(email: string, password: string) {
    const data = await this.request(`${AUTH_BASE}/api/Auth/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data && data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const data = await this.request(`${AUTH_BASE}/api/Auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data && data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async getGoal() {
    return this.request(`${GOAL_BASE}/goal`, {
      method: "GET",
    });
  },

  async createGoal(goalText: string) {
    return this.request(`${GOAL_BASE}/goal`, {
      method: "POST",
      body: JSON.stringify({ goalText }),
    });
  },

  async toggleTask(taskId: string, completed: boolean) {
    return this.request(`${TASK_BASE}/task/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    });
  },
};
