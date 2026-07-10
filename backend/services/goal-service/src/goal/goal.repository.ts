import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class GoalRepository {
  private pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  private readonly logger = new Logger(GoalRepository.name);

  constructor() {
    this.initDb();
  }

  private async initDb() {
    try {
      await this.pool.query(`
        ALTER TABLE goals ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;
      `);
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      this.logger.log('Database schema ensured (stages column and chat_messages table)');
    } catch (e) {
      this.logger.error('Failed to init DB schema', e);
    }
  }

  async createGoal(userId: string, text: string, stages: any[]): Promise<string> {
    const res = await this.pool.query(
      'INSERT INTO goals (user_id, text, stages) VALUES ($1, $2, $3) RETURNING id',
      [userId, text, JSON.stringify(stages)]
    );
    return res.rows[0].id;
  }

  async saveTasks(goalId: string, tasks: string[]): Promise<void> {
    for (let i = 0; i < tasks.length; i++) {
      await this.pool.query(
        'INSERT INTO tasks (goal_id, text, order_index) VALUES ($1, $2, $3)',
        [goalId, tasks[i], i]
      );
    }
  }

  // Returns ALL goals for a user
  async getAllGoalsWithTasks(userId: string) {
    const goalRes = await this.pool.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    if (goalRes.rows.length === 0) return [];

    const goals: any[] = goalRes.rows;
    const goalIds = goals.map((g: any) => g.id);
    
    // Fetch all tasks for these goals
    const tasksRes = await this.pool.query(
      'SELECT * FROM tasks WHERE goal_id = ANY($1) ORDER BY order_index',
      [goalIds]
    );

    const tasksByGoal: Record<string, any[]> = {};
    for (const task of tasksRes.rows as any[]) {
      if (!tasksByGoal[task.goal_id]) tasksByGoal[task.goal_id] = [];
      tasksByGoal[task.goal_id].push(task);
    }

    return goals.map((g: any) => ({
      ...g,
      tasks: tasksByGoal[g.id] || []
    }));
  }

  // Keep for backwards compatibility if needed
  async getGoalWithTasks(userId: string) {
    const goals = await this.getAllGoalsWithTasks(userId);
    return goals.length > 0 ? goals[0] : null;
  }

  async updateGoal(goalId: string, userId: string, text: string): Promise<boolean> {
    const res = await this.pool.query(
      'UPDATE goals SET text = $1 WHERE id = $2 AND user_id = $3',
      [text, goalId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async deleteGoal(goalId: string, userId: string): Promise<boolean> {
    const res = await this.pool.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async saveChatMessage(userId: string, role: string, content: string) {
    await this.pool.query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3)',
      [userId, role, content]
    );
  }

  async getChatHistory(userId: string) {
    const res = await this.pool.query(
      'SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return res.rows;
  }
}
