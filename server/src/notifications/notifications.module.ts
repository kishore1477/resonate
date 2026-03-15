import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { WebhookService } from './webhook.service';

@Module({
  providers: [EmailService, WebhookService],
  exports: [EmailService, WebhookService],
})
export class NotificationsModule { }
