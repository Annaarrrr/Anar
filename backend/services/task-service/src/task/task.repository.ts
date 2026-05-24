import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TaskRepository {
  private pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async updateTask(id: string, completed: boolean) {
    const completedAt = completed ? new Date() : null;
    const res = await this.pool.query(
      'UPDATE tasks SET completed = $1, completed_at = $2 WHERE id = $3 RETURNING *',
      [completed, completedAt, id]
    );
    return res.rows[0];
  }

  async getTask(id: string) {
    const res = await this.pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return res.rows[0];
  }
}
