import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PushProvider implements OnModuleInit {
  private readonly logger = new Logger(PushProvider.name);
  private app!: admin.app.App;
  private isFcmInitialized = false;

  onModuleInit(): void {
    const projectId = process.env.FCM_PROJECT_ID;
    const clientEmail = process.env.FCM_CLIENT_EMAIL;
    // Firebase stores private keys with literal \n — we unescape them at runtime.
    const privateKey = (process.env.FCM_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'FCM env vars (FCM_PROJECT_ID, FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY) are not fully set. ' +
          'Push notifications will be logged but NOT actually sent.',
      );
      this.isFcmInitialized = false;
      return;
    }

    try {
      // Guard: avoid re-initialising if the app already exists (e.g. hot-reload).
      if (admin.apps.length === 0) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log('Firebase Admin SDK initialised successfully.');
      } else {
        this.app = admin.apps[0] as admin.app.App;
        this.logger.log('Reusing existing Firebase Admin SDK instance.');
      }
      this.isFcmInitialized = true;
    } catch (err: any) {
      this.logger.error(`Failed to initialize Firebase Admin SDK: ${err.message}`);
      this.isFcmInitialized = false;
    }
  }

  /**
   * Sends a multicast push notification to one or more FCM tokens.
   *
   * @param tokens   - Array of FCM registration tokens.
   * @param title    - Notification title shown on the device.
   * @param body     - Notification body text shown on the device.
   * @param data     - Optional hidden key-value payload (e.g. deep-link data).
   * @returns        Number of messages successfully delivered.
   */
  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<number> {
    if (!tokens || tokens.length === 0) {
      this.logger.warn('sendPushNotification called with an empty token list — skipping.');
      return 0;
    }

    if (!this.isFcmInitialized) {
      this.logger.log(
        `[FCM MOCK SEND] Would send push notification to ${tokens.length} tokens. ` +
          `Title: "${title}", Body: "${body}"`,
      );
      return tokens.length;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      ...(data && { data }),
      android: {
        priority: 'high',
        notification: { sound: 'default' },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 },
        },
      },
    };

    try {
      const response = await this.app.messaging().sendEachForMulticast(message);

      this.logger.log(
        `FCM multicast result — successCount: ${response.successCount}, ` +
          `failureCount: ${response.failureCount}`,
      );

      // Log individual failures so they can be acted upon (e.g. remove stale tokens).
      response.responses.forEach((res: any, idx: number) => {
        if (!res.success) {
          this.logger.error(
            `Token [${idx}] "${tokens[idx]}" failed: ${res.error?.message ?? 'unknown error'}`,
          );
        }
      });

      return response.successCount;
    } catch (error: unknown) {
      const message_ = error instanceof Error ? error.message : String(error);
      this.logger.error(`FCM sendEachForMulticast threw an exception: ${message_}`);
      throw error;
    }
  }
}