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

  async subscribeToNewsletter(contact: { email?: string; phone?: string }, whatsappOptIn = false): Promise<{ status: string }> {
    if (contact.email) {
      await this.prisma.newsletterSubscription.upsert({
        where: { email: contact.email },
        create: { email: contact.email, phone: null, whatsapp_opt_in: false },
        update: {
          is_active: true,
          unsubscribed_at: null,
          deleted_at: null,
          whatsapp_opt_in: false,
        },
      });
      return { status: 'SUBSCRIBED' };
    }
    const existing = await this.prisma.newsletterSubscription.findFirst({ where: { phone: contact.phone } });
    const data = {
      email: null,
      phone: contact.phone ?? null,
      whatsapp_opt_in: whatsappOptIn,
      is_active: true,
      unsubscribed_at: null,
      deleted_at: null,
    };
    if (existing) {
      await this.prisma.newsletterSubscription.update({ where: { id: existing.id }, data });
    } else {
      await this.prisma.newsletterSubscription.create({ data });
    }

    return { status: 'SUBSCRIBED' };
  }
}
