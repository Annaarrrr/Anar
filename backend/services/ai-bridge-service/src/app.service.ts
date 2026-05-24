import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getHealth(): { status: string; service: string } {
    return {
      status: 'healthy',
      service: 'ai-bridge-service'
    };
  }

  async generateTasks(goalText: string) {
    try {
      const aiLogicUrl = process.env.AI_LOGIC_URL || 'http://ai-logic:8000';
      const response = await lastValueFrom(
        this.httpService.post(`${aiLogicUrl}/generate`, { goalText })
      );
      return response.data;
    } catch (e: any) {
      console.error('AI Logic call failed:', e?.message || e);
      throw new InternalServerErrorException('AI Logic service failed');
    }
  }
}