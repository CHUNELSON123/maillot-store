import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GetNotificationsUseCase } from '../../application/use-cases/get-notifications.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from '../../application/use-cases/mark-all-notifications-read.use-case';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller({
  path: 'notifications',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Customer')
export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  @Get()
  getNotifications(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.getNotificationsUseCase.execute(
      request.user.id,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Req() request: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ) {
    return this.markNotificationReadUseCase.execute(
      request.user.id,
      notificationId,
    );
  }

  @Patch('read-all')
  markAllAsRead(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.markAllNotificationsReadUseCase.execute(
      request.user.id,
    );
  }
}