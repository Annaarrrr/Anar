export type Screen = "home" | "chat" | "vision";

export interface Goal {
  id: string;
  text: string;
}

export interface Task {
  id: string;
  goal_id?: string;
  text: string;
  completed: boolean;
  order_index?: number;
  completed_at?: string | null;
}

export interface Message {
  id: string | number;
  role: "user" | "ai";
  text: string;
  time: string;
}
