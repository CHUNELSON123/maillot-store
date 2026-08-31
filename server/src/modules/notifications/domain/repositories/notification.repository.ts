import { NotificationEntity } from '../entities/notification.entity';

export abstract class NotificationRepository {
  abstract findByUserId(
    userId: string,
  ): Promise<NotificationEntity[]>;

  abstract markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationEntity>;

  abstract markAllAsRead(
    userId: string,
  ): Promise<void>;
}