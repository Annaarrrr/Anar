import { Injectable, Logger } from '@nestjs/common';

/**
 * Placeholder email provider.
 * Extend this with Nodemailer / SendGrid / SES when email notifications are needed.
 */
@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // TODO: integrate real email transport here.
    this.logger.log(`[MOCK] Email → ${to} | Subject: "${subject}" | Body: "${body}"`);
  }
}