import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class DailyCron {
  private readonly logger = new Logger(DailyCron.name);

  constructor(private readonly notificationService: NotificationService) { }

  /**
   * 🕘 PRODUCTION schedule: fires once every day at 09:00 AM (server local time).
   *
   * 🧪 FOR LOCAL TESTING: swap the cron expression to run every 10 seconds:
   *    @Cron('*\/10 * * * * *')
   *    This lets you watch the full notification loop fire repeatedly in your
   *    terminal without waiting for 9 AM. Switch back before deploying!
   *
   * Current mode: ✅ PRODUCTION (EVERY_DAY_AT_9AM)
   *               💡 To test: comment out line below and uncomment the @Cron above.
   */
  //@Cron(CronExpression.EVERY_DAY_AT_9AM)
  @Cron('*/10 * * * * *') // ← UNCOMMENT for rapid local testing (every 10s)
  async handleDailyProgressNotifications(): Promise<void> {
    this.logger.log('⏰ Cron triggered: handleDailyProgressNotifications');

    const startTime = Date.now();

    try {
      await this.notificationService.sendDailyProgressNotifications();
      const elapsed = Date.now() - startTime;
      this.logger.log(`✅ Cron completed successfully in ${elapsed}ms.`);
    } catch (error: unknown) {
      const elapsed = Date.now() - startTime;
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Cron failed after ${elapsed}ms: ${msg}`, error instanceof Error ? error.stack : undefined);
    }
  }
}