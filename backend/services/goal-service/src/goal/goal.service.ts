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
    let stages: any[] = [];
    let flatTasks: string[] = [];

    try {
      const guardSecret = process.env.GUARD_SECRET || 'dev3-local-secret-token';
      const response = await lastValueFrom(
        this.httpService.post(
          `${process.env.AI_BRIDGE_SERVICE_URL}/generate-tasks`,
          { goalText: text },
          { headers: { Authorization: `Bearer ${guardSecret}` } }
        )
      );
      
      const rawStages = response.data.stages || [];
      stages = rawStages.map((st: any) => {
        flatTasks.push(...(st.tasks || []));
        return {
          id: 's' + Math.random().toString(36).substr(2, 5),
          label: st.label,
          sublabel: st.sublabel,
          emoji: st.emoji,
          tasks_count: (st.tasks || []).length
        };
      });
    } catch (e: any) {
      console.error('AI Bridge call failed:', e?.message || e);
      // Fallback
      flatTasks = ["Set up environment", "Review progress"];
      stages = [{ id: 's0', label: "Preparation", sublabel: "Start", emoji: "🚀", tasks_count: 2 }];
    }

    const goalId = await this.goalRepo.createGoal(userId, text, stages);
    await this.goalRepo.saveTasks(goalId, flatTasks);
    
    return this.getGoal(userId);
  }

  async chat(messages: Array<{ role: string; content: string }>, lang: string, userId: string) {
    try {
      // Save user's message
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'user') {
        await this.goalRepo.saveChatMessage(userId, lastMsg.role, lastMsg.content);
      }

      const guardSecret = process.env.GUARD_SECRET || 'dev3-local-secret-token';
      const response = await lastValueFrom(
        this.httpService.post(
          `${process.env.AI_BRIDGE_SERVICE_URL}/chat`,
          { messages, lang },
          { headers: { Authorization: `Bearer ${guardSecret}` } }
        )
      );
      
      // Save AI's response
      const aiResponse = response.data;
      if (aiResponse && aiResponse.response_ar) {
        await this.goalRepo.saveChatMessage(userId, 'assistant', aiResponse.response_ar);
      }

      return aiResponse;
    } catch (e: any) {
      console.error('AI Bridge chat call failed:', e?.message || e);
      return {
        response_ar: 'معلش يا بطل، في مشكلة في السيرفر حالياً. قولي تاني حابب تركز على إيه؟',
        suggestedGoal: null
      };
    }
  }

  async getGoal(userId: string) {
    return this.goalRepo.getGoalWithTasks(userId);
  }

  async getAllGoals(userId: string) {
    return this.goalRepo.getAllGoalsWithTasks(userId);
  }

  async getChatHistory(userId: string) {
    return this.goalRepo.getChatHistory(userId);
  }

  async updateGoal(goalId: string, userId: string, text: string): Promise<boolean> {
    return this.goalRepo.updateGoal(goalId, userId, text);
  }

  async deleteGoal(goalId: string, userId: string): Promise<boolean> {
    return this.goalRepo.deleteGoal(goalId, userId);
  }
}

