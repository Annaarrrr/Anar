import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailProvider implements OnModuleInit {
  private readonly logger = new Logger(EmailProvider.name);
  private transporter: Transporter;

  onModuleInit(): void {
    this.transporter = nodemailer.createTransport({
      // Default to 'mailpit' if SMTP_HOST is not found in the .env file
      host: process.env.SMTP_HOST || 'mailpit',
      // Default to 1025 if SMTP_PORT is not found
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 1025,
      secure: false, 
      ignoreTLS: true, // Prevents certificate errors during local Docker testing
      
      // Only attach the auth block if the user actually provided a username
      ...(process.env.SMTP_USER && {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }),
    });

    this.logger.log(
      `Email transporter initialised → ${process.env.SMTP_HOST || 'mailpit'}:${process.env.SMTP_PORT || 1025}`,
    );
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    const info = await this.transporter.sendMail({
      // Use a dummy email for local testing if SMTP_USER is not set
      from: `"Anar Notifications" <${process.env.SMTP_USER || 'noreply@anar.local'}>`,
      to,
      subject,
      html: body,
    });

    this.logger.log(`Email sent to ${to} — Message ID: ${info.messageId}`);
  }
}