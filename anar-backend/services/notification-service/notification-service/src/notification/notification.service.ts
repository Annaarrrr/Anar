import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from '../providers/email.provider';
import { buildDailyDigestTemplate } from './notification.template';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly emailProvider: EmailProvider) {}

  async sendDailyDigest(
    email: string,
    name: string,
    taskCount: number,
  ): Promise<void> {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = buildDailyDigestTemplate({ name, taskCount, date });

    const subject = `📋 Your Daily Digest — ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} pending`;

    await this.emailProvider.send(email, subject, html);

    this.logger.log(
      `Daily digest sent → ${email} (name: ${name}, tasks: ${taskCount})`,
    );
  }
}