import { Injectable } from '@nestjs/common';
import { CommunicationsRepository } from '../domain/communications.repository';

@Injectable()
export class SubscribeNewsletterUseCase {
  constructor(private readonly repository: CommunicationsRepository) {}

  execute(email: string) {
    return this.repository.subscribeToNewsletter(email.trim().toLowerCase());
  }
}
