import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailProvider implements OnModuleInit {
  private readonly logger = new Logger(EmailProvider.name);
  private transporter: Transporter;

  onModuleInit(): void {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // false = STARTTLS (Mailtrap default); set true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.logger.log(
      `Email transporter initialised → ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`,
    );
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    const info = await this.transporter.sendMail({
      from: `"AI Bridge" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: body,
    });

    this.logger.log(`Email sent to ${to} — Message ID: ${info.messageId}`);
  }
}