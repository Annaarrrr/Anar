import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyCron } from './daily.corn';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    // Registers the NestJS cron/interval/timeout infrastructure.
    ScheduleModule.forRoot(),
    // Provides NotificationService to DailyCron via its exports.
    NotificationModule,
  ],
  providers: [DailyCron],
})
export class SchedulerModule {}