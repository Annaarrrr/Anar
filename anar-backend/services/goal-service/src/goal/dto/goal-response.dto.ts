export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface GoalResponseDto {
  id: string;
  userId: string;
  text: string;
  tasks: Task[];
}
