import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { NotificationRepository } from '../domain/repositories/notification.repository';
import { NotificationEntity } from '../domain/entities/notification.entity';

@Injectable()
export class PrismaNotificationRepository
  implements NotificationRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByUserId(
    userId: string,
  ): Promise<NotificationEntity[]> {
    const notifications =
      await this.prisma.notification.findMany({
        where: {
          user_id: userId,
          deleted_at: null,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

    return notifications.map(
      (notification) =>
        new NotificationEntity(
          notification.id,
          notification.user_id,
          notification.title,
          notification.message,
          notification.type,
          notification.is_read,
          notification.created_at,
          notification.updated_at,
        ),
    );
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationEntity> {
    const notification =
      await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          user_id: userId,
          deleted_at: null,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found.',
      );
    }

    const updated =
      await this.prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          is_read: true,
        },
      });

    return new NotificationEntity(
      updated.id,
      updated.user_id,
      updated.title,
      updated.message,
      updated.type,
      updated.is_read,
      updated.created_at,
      updated.updated_at,
    );
  }

  async markAllAsRead(
    userId: string,
  ): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false,
        deleted_at: null,
      },
      data: {
        is_read: true,
      },
    });
  }
}