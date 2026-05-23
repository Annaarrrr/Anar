import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { EmailProvider } from '../providers/email.provider';

@Module({
  imports: [ConfigModule],
  providers: [EmailProvider, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}