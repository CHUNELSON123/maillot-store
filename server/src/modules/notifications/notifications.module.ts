import { Module } from '@nestjs/common';
import { NotificationController } from './presentation/controllers/notification.controller';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { NotificationRepository } from './domain/repositories/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/prisma-notification.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [NotificationController],
  providers: [
    PrismaService,
    GetNotificationsUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    {
      provide: NotificationRepository,
      useClass: PrismaNotificationRepository,
    },
  ],
})
export class NotificationsModule {}