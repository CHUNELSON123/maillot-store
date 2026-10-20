import { Module } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SubmitContactMessageUseCase } from './application/submit-contact-message.use-case';
import { SubscribeNewsletterUseCase } from './application/subscribe-newsletter.use-case';
import { CommunicationsRepository } from './domain/communications.repository';
import { PrismaCommunicationsRepository } from './infrastructure/prisma-communications.repository';
import { CommunicationsController } from './presentation/communications.controller';

@Module({
  controllers: [CommunicationsController],
  providers: [
    PrismaService,
    SubmitContactMessageUseCase,
    SubscribeNewsletterUseCase,
    {
      provide: CommunicationsRepository,
      useClass: PrismaCommunicationsRepository,
    },
  ],
})
export class CommunicationsModule {}
