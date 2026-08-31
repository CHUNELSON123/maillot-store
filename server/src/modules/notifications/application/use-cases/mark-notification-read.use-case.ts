import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../domain/repositories/notification.repository';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  execute(
    userId: string,
    notificationId: string,
  ) {
    return this.notificationRepository.markAsRead(
      userId,
      notificationId,
    );
  }
}