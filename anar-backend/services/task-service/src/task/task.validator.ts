import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TaskValidator {
  private pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async validateOwnership(taskId: string, userId: string) {
    const res = await this.pool.query(
      `SELECT t.id FROM tasks t 
       JOIN goals g ON t.goal_id = g.id 
       WHERE t.id = $1 AND g.user_id = $2`,
      [taskId, userId]
    );
    if (res.rows.length === 0) throw new ForbiddenException('Task does not belong to user');
  }
}
