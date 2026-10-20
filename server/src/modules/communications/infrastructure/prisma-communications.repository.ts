import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import {
  CommunicationsRepository,
  SubmitContactMessageData,
} from '../domain/communications.repository';

@Injectable()
export class PrismaCommunicationsRepository extends CommunicationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async submitContactMessage(data: SubmitContactMessageData) {
    const message = await this.prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
      select: { id: true, created_at: true },
    });

    return { id: message.id, createdAt: message.created_at };
  }

  async subscribeToNewsletter(email: string): Promise<{ status: string }> {
    await this.prisma.newsletterSubscription.upsert({
      where: { email },
      create: { email },
      update: {
        is_active: true,
        unsubscribed_at: null,
        deleted_at: null,
      },
    });

    return { status: 'SUBSCRIBED' };
  }
}
