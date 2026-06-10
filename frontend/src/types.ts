export type AppScreen  = "onboarding" | "auth" | "main";
export type ActiveTab  = "home" | "chat" | "vision" | "progress";
export type Language   = 'ar' | 'en';
export type Theme      = 'light' | 'dark';


export interface JourneyStage {
  id: string;
  label: string;
  sublabel: string;
  emoji: string;
}

export interface GoalPin {
  id: string;
  text: string;
  emoji: string;
  color: string;       // card background color
  pinColor: string;    // pushpin color
  rotation: number;    // card tilt in degrees
  createdAt: string;
  tasks: Task[];
  stages: JourneyStage[];
}

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
