import { Body, Controller, Post } from '@nestjs/common';
import { SubmitContactMessageUseCase } from '../application/submit-contact-message.use-case';
import { SubscribeNewsletterUseCase } from '../application/subscribe-newsletter.use-case';
import { SubmitContactMessageDto } from './dto/submit-contact-message.dto';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Controller({ path: 'communications', version: '1' })
export class CommunicationsController {
  constructor(
    private readonly submitContactMessage: SubmitContactMessageUseCase,
    private readonly subscribeNewsletter: SubscribeNewsletterUseCase,
  ) {}

  @Post('contact-messages')
  submitContact(@Body() dto: SubmitContactMessageDto) {
    return this.submitContactMessage.execute(dto);
  }

  @Post('newsletter/subscriptions')
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.subscribeNewsletter.execute(dto.email);
  }
}
