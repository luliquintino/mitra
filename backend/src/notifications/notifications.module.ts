import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ResendProvider } from './resend.provider';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, ResendProvider],
  exports: [NotificationsService, ResendProvider],
})
export class NotificationsModule {}
