import { Injectable } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { TaskValidator } from './task.validator';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly taskValidator: TaskValidator
  ) {}

  async updateTask(taskId: string, userId: string, completed: boolean) {
    await this.taskValidator.validateOwnership(taskId, userId);
    return this.taskRepo.updateTask(taskId, completed);
  }
}
