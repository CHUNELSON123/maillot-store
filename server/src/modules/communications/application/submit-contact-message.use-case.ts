import { Injectable } from '@nestjs/common';
import {
  CommunicationsRepository,
  SubmitContactMessageData,
} from '../domain/communications.repository';

@Injectable()
export class SubmitContactMessageUseCase {
  constructor(private readonly repository: CommunicationsRepository) {}

  execute(data: SubmitContactMessageData) {
    return this.repository.submitContactMessage({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
    });
  }
}
