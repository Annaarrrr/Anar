import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { TaskValidator } from './task.validator';

@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, TaskValidator],
})
export class TaskModule {}
