export interface TaskResponseDto {
  id: string;
  goalId: string;
  text: string;
  completed: boolean;
  orderIndex: number;
  completedAt: Date | null;
}
