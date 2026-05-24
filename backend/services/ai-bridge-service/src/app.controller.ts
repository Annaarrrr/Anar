import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('ai-bridge')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Post('generate-tasks')
  generateTasks(@Body() body: { goalText: string }) {
    return this.appService.generateTasks(body.goalText);
  }
}