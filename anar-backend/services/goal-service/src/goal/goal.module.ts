import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { GoalRepository } from './goal.repository';

@Module({
  imports: [HttpModule],
  controllers: [GoalController],
  providers: [GoalService, GoalRepository],
})
export class GoalModule {}
