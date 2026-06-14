import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushProvider } from '../providers/push.providers';
import { EmailProvider } from '../providers/email.providers';

@Module({
  providers: [
    NotificationService,
    PushProvider,
    EmailProvider,
  ],
  // Export NotificationService so SchedulerModule can inject it into DailyCron.
  exports: [NotificationService],
})
export class NotificationModule {}