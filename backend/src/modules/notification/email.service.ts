import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isConfigured: boolean;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('email.sendgridApiKey');
    this.fromEmail = this.configService.get<string>('email.fromEmail') || 'noreply@seda.fm';
    this.fromName = this.configService.get<string>('email.fromName') || 'sedā';

    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      this.logger.log('SendGrid email service configured');
    } else {
      this.isConfigured = false;
      this.logger.warn('SendGrid API key not configured - emails will be logged only');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, text, html } = options;

    if (!this.isConfigured) {
      this.logger.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
      this.logger.debug(`[EMAIL MOCK] HTML: ${html.substring(0, 200)}...`);
      return true;
    }

    try {
      await sgMail.send({
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        text: text || this.stripHtml(html),
        html,
      });
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}
