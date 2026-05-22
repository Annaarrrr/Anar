import { Module } from '@nestjs/common';
import { GoalModule } from './goal/goal.module';

@Module({
  imports: [GoalModule],
})
export class AppModule {}
