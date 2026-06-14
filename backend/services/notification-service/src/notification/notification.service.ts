import { Injectable, Logger } from '@nestjs/common';
import { PushProvider } from '../providers/push.providers';
import { NotificationTemplate } from './notification.template';

// ---------------------------------------------------------------------------
// Interfaces — mirrors the real contracts Dev 1 & Dev 2 will expose.
// ---------------------------------------------------------------------------

/** Shape returned by Dev 2: GET http://localhost:3003/tasks/progress-notifications */
interface UserTaskProgress {
  userId: string;
  totalTasks: number;
  completedTasks: number;
}

/** Shape returned by Dev 1: GET http://localhost:3001/users/:userId/tokens */
interface UserTokensResponse {
  userId: string;
  tokens: string[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly pushProvider: PushProvider) {}

  // -------------------------------------------------------------------------
  // Public orchestration entry-point (called by the cron job)
  // -------------------------------------------------------------------------

  /**
   * Main pipeline:
   *  1. Fetch all users with pending progress (Dev 2 — mocked).
   *  2. For each user, fetch their FCM tokens (Dev 1 — mocked).
   *  3. Build the notification payload via the template factory.
   *  4. Fire the push via FCM.
   */
  async sendDailyProgressNotifications(): Promise<void> {
    this.logger.log('═══════════════════════════════════════════════════');
    this.logger.log('  🔔 Daily Progress Notification Pipeline — START  ');
    this.logger.log('═══════════════════════════════════════════════════');

    // Step 1 — Fetch progress data (Dev 2).
    const progressList = await this.getMockPendingUsers();
    this.logger.log(`Step 1 ✅ Fetched progress for ${progressList.length} user(s) from [Dev 2 MOCK].`);

    if (progressList.length === 0) {
      this.logger.warn('No users with task progress found. Aborting pipeline.');
      return;
    }

    // Step 2 — Process each user sequentially (use Promise.allSettled for parallelism in prod).
    let successCount = 0;
    let failCount = 0;

    for (const progress of progressList) {
      try {
        await this.processUserNotification(progress);
        successCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to process notification for userId="${progress.userId}": ${msg}`);
        failCount++;
      }
    }

    this.logger.log('═══════════════════════════════════════════════════');
    this.logger.log(
      `  🏁 Pipeline DONE — ✅ ${successCount} sent, ❌ ${failCount} failed  `,
    );
    this.logger.log('═══════════════════════════════════════════════════');
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /** Processes a single user's notification end-to-end. */
  private async processUserNotification(progress: UserTaskProgress): Promise<void> {
    const { userId, totalTasks, completedTasks } = progress;

    this.logger.log(`─── Processing userId="${userId}" | ${completedTasks}/${totalTasks} tasks ───`);

    // Step 2a — Fetch FCM tokens for this user (Dev 1).
    const { tokens } = await this.getMockTokens(userId);

    if (tokens.length === 0) {
      this.logger.warn(`  ⚠️  No active FCM tokens for userId="${userId}" — skipping.`);
      return;
    }

    this.logger.log(`  Step 2 ✅ Fetched ${tokens.length} FCM token(s) from [Dev 1 MOCK].`);

    // Step 3 — Build the notification payload.
    const { title, body } = NotificationTemplate.buildDailyProgress(totalTasks, completedTasks);

    this.logger.log(`  Step 3 ✅ Notification built:`);
    this.logger.log(`           Title : "${title}"`);
    this.logger.log(`           Body  : "${body}"`);

    // Step 4 — Deep-link data payload (navigates to daily_tasks_screen on tap).
    const data: Record<string, string> = {
      screen: 'daily_tasks_screen',
      userId,
    };

    this.logger.log(`  Step 4 🚀 Sending FCM push to ${tokens.length} device(s)...`);

    const delivered = await this.pushProvider.sendPushNotification(tokens, title, body, data);

    this.logger.log(
      `  Step 4 ✅ FCM delivered to ${delivered}/${tokens.length} device(s) for userId="${userId}".`,
    );
  }

  // =========================================================================
  // MOCK DATA LAYER
  // =========================================================================
  // ⚠️  REPLACE these two methods with real @nestjs/axios HTTP calls once
  //     Dev 1 (localhost:3001) and Dev 2 (localhost:3003) are available.
  //
  //  Dev 2 real call:
  //    const { data } = await this.httpService.axiosRef.get<UserTaskProgress[]>(
  //      'http://localhost:3003/tasks/progress-notifications',
  //    );
  //    return data;
  //
  //  Dev 1 real call:
  //    const { data } = await this.httpService.axiosRef.get<UserTokensResponse>(
  //      `http://localhost:3001/users/${userId}/tokens`,
  //    );
  //    return data;
  // =========================================================================

  /**
   * [MOCK — Dev 2]
   * Simulates GET http://localhost:3003/tasks/progress-notifications
   *
   * Returns a diverse set of users covering all progress scenarios so you can
   * observe every template branch fire in your terminal.
   */
  private async getMockPendingUsers(): Promise<UserTaskProgress[]> {
    this.logger.debug('[MOCK] getMockPendingUsers() — returning hardcoded fixture data.');

    // Artificial delay to simulate a real network round-trip (remove in prod).
    await this.simulateNetworkDelay(80);

    return [
      // Scenario A: Just getting started (0% complete)
      { userId: 'user-001', totalTasks: 8, completedTasks: 0 },

      // Scenario B: Early progress (25%)
      { userId: 'user-002', totalTasks: 12, completedTasks: 3 },

      // Scenario C: Halfway through (50%)
      { userId: 'user-003', totalTasks: 10, completedTasks: 5 },

      // Scenario D: Almost done (90%)
      { userId: 'user-004', totalTasks: 10, completedTasks: 9 },

      // Scenario E: Fully completed (100%) — celebration message
      { userId: 'user-005', totalTasks: 6, completedTasks: 6 },

      // Scenario F: No tasks set — edge case
      { userId: 'user-006', totalTasks: 0, completedTasks: 0 },

      // Scenario G: Single task, not done
      { userId: 'user-007', totalTasks: 1, completedTasks: 0 },
    ];
  }

  /**
   * [MOCK — Dev 1]
   * Simulates GET http://localhost:3001/users/:userId/tokens
   *
   * Returns realistic-looking FCM token strings per user.
   * user-006 intentionally has no tokens to test the empty-token guard.
   */
  private async getMockTokens(userId: string): Promise<UserTokensResponse> {
    this.logger.debug(`[MOCK] getMockTokens("${userId}") — returning hardcoded fixture data.`);

    await this.simulateNetworkDelay(40);

    const tokenMap: Record<string, string[]> = {
      'user-001': [
        'fcm_mock_token_user001_android_A1B2C3D4E5F6',
        'fcm_mock_token_user001_ios_G7H8I9J0K1L2',
      ],
      'user-002': ['fcm_mock_token_user002_android_M3N4O5P6Q7R8'],
      'user-003': [
        'fcm_mock_token_user003_android_S9T0U1V2W3X4',
        'fcm_mock_token_user003_ios_Y5Z6A7B8C9D0',
        'fcm_mock_token_user003_web_E1F2G3H4I5J6',
      ],
      'user-004': ['fcm_mock_token_user004_android_K7L8M9N0O1P2'],
      'user-005': ['fcm_mock_token_user005_ios_Q3R4S5T6U7V8'],
      'user-006': [], // ← intentionally empty — tests the no-token guard branch
      'user-007': ['fcm_mock_token_user007_android_W9X0Y1Z2A3B4'],
    };

    return {
      userId,
      tokens: tokenMap[userId] ?? [],
    };
  }

  /** Simulates async network latency — remove when switching to real HTTP calls. */
  private simulateNetworkDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}