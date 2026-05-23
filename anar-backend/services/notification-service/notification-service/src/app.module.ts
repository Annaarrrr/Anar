import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { NotificationModule } from './notification/notification.module';
import { DailyCron } from './scheduler/daily.cron';

@Module({
  imports: [
    // ── Registers the scheduler engine globally. Must be imported once at root. ──
    ScheduleModule.forRoot(),

    NotificationModule,
  ],
  providers: [
    // ── DailyCron lives here because it is an app-level concern, not tied       ──
    // ── to a specific feature module. Move it to a SchedulerModule if it grows. ──
    DailyCron,
  ],
})
export class AppModule {}