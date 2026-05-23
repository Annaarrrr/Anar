import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';

interface PendingUser {
  email: string;
  name: string;
  taskCount: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace this array with a real DB/repository call when the data layer is ready
const MOCK_PENDING_USERS: PendingUser[] = [
  { email: 'your@email.com', name: 'Your Name', taskCount: 3 },
  { email: 'colleague@email.com', name: 'Colleague', taskCount: 7 },
];

@Injectable()
export class DailyCron {
  private readonly logger = new Logger(DailyCron.name);

  constructor(private readonly notificationService: NotificationService) {}

  // ── Change CronExpression.EVERY_MINUTE  →  CronExpression.EVERY_DAY_AT_MIDNIGHT
  // ── when you're ready to go to production.
  @Cron(CronExpression.EVERY_MINUTE)
  async handleDailyDigest(): Promise<void> {
    this.logger.log(
      `[DailyCron] Triggered — processing ${MOCK_PENDING_USERS.length} user(s)…`,
    );

    const results = await Promise.allSettled(
      MOCK_PENDING_USERS.map((user) =>
        this.notificationService.sendDailyDigest(
          user.email,
          user.name,
          user.taskCount,
        ),
      ),
    );

    let sent = 0;
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        sent++;
      } else {
        failed++;
        this.logger.error(
          `[DailyCron] Failed to send digest to ${MOCK_PENDING_USERS[index].email}: ${result.reason}`,
        );
      }
    });

    this.logger.log(
      `[DailyCron] Run complete — ✅ ${sent} sent, ❌ ${failed} failed.`,
    );
  }
}