import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GoalRepository } from './goal.repository';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GoalService {
  constructor(
    private readonly goalRepo: GoalRepository,
    private readonly httpService: HttpService
  ) {}

  async createGoal(userId: string, text: string) {
    let tasks: string[] = [];
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${process.env.AI_BRIDGE_SERVICE_URL}/generate-tasks`, { goalText: text })
      );
      tasks = response.data.tasks;
    } catch (e) {
      throw new InternalServerErrorException('AI Bridge service failed');
    }

    const goalId = await this.goalRepo.createGoal(userId, text);
    await this.goalRepo.saveTasks(goalId, tasks);
    
    return this.getGoal(userId);
  }

  async getGoal(userId: string) {
    return this.goalRepo.getGoalWithTasks(userId);
  }
}
