import { BadRequestException, Injectable } from '@nestjs/common';
import { CommunicationsRepository } from '../domain/communications.repository';
import { WhatsAppNotificationService } from '../infrastructure/whatsapp-notification.service';

@Injectable()
export class SubscribeNewsletterUseCase {
  constructor(
    private readonly repository: CommunicationsRepository,
    private readonly whatsapp: WhatsAppNotificationService,
  ) {}

  async execute(value: string, whatsappOptIn = false) {
    const contact = value.trim();
    if (!contact) throw new BadRequestException('Enter an email address or WhatsApp number.');
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    if (isEmail) {
      if (whatsappOptIn) throw new BadRequestException('Enter a WhatsApp number to opt in to WhatsApp updates.');
      await this.repository.subscribeToNewsletter({ email: contact.toLowerCase() }, false);
      return { status: 'SUBSCRIBED' };
    }
    const phone = contact.replace(/[\s().-]/g, '');
    if (!/^\+?[0-9]{7,20}$/.test(phone)) {
      throw new BadRequestException('Enter a valid email address or WhatsApp number.');
    }
    if (whatsappOptIn && !phone) {
      throw new BadRequestException('Enter a WhatsApp number to opt in to WhatsApp updates.');
    }
    const result = await this.repository.subscribeToNewsletter({ phone }, whatsappOptIn);
    if (whatsappOptIn) {
      try { await this.whatsapp.notifyNewsletterSubscriber(phone.trim()); }
      catch { /* A messaging provider error must not discard a saved newsletter subscription. */ }
    }
    return result;
  }
}
