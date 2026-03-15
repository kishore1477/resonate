import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email transporter configured');
    } else {
      this.logger.warn('Email transporter not configured - emails will be logged only');
    }
  }

  async send(options: EmailOptions): Promise<boolean> {
    const from = this.configService.get<string>('SMTP_FROM') || 'noreply@resonate.app';

    if (!this.transporter) {
      this.logger.log(`[DEV] Email to ${options.to}: ${options.subject}`);
      this.logger.debug(options.html);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendPasswordReset(email: string, token: string, name: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    return this.send({
      to: email,
      subject: 'Reset your Resonate password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Reset Your Password</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">Resonate - Customer Feedback Platform</p>
        </div>
      `,
    });
  }

  async sendPostStatusUpdate(
    email: string,
    postTitle: string,
    newStatus: string,
    workspaceName: string,
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Feature update: "${postTitle}" is now ${newStatus}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Feature Update</h1>
          <p>A feature you voted for has been updated!</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">${postTitle}</h2>
            <p style="margin: 0;">Status: <strong style="color: #6366f1;">${newStatus}</strong></p>
          </div>
          <p>Thanks for your feedback!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">${workspaceName} powered by Resonate</p>
        </div>
      `,
    });
  }

  async sendChangelogNotification(
    email: string,
    title: string,
    excerpt: string,
    workspaceName: string,
    changelogUrl: string,
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: `${workspaceName}: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">${title}</h1>
          <p>${excerpt}</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${changelogUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Read More
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">${workspaceName} powered by Resonate</p>
        </div>
      `,
    });
  }
}
