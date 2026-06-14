import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class GoalRepository {
  private pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  async createGoal(userId: string, text: string): Promise<string> {
    const res = await this.pool.query(
      'INSERT INTO goals (user_id, text) VALUES ($1, $2) RETURNING id',
      [userId, text]
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

  async getGoalWithTasks(userId: string) {
    const goalRes = await this.pool.query('SELECT * FROM goals WHERE user_id = $1', [userId]);
    if (goalRes.rows.length === 0) return null;

    const goal = goalRes.rows[0];
    const tasksRes = await this.pool.query('SELECT * FROM tasks WHERE goal_id = $1 ORDER BY order_index', [goal.id]);

    return {
      ...goal,
      tasks: tasksRes.rows
    };
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
}

