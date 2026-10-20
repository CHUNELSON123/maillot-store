export interface SubmitContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export abstract class CommunicationsRepository {
  abstract submitContactMessage(
    data: SubmitContactMessageData,
  ): Promise<{ id: string; createdAt: Date }>;

  abstract subscribeToNewsletter(email: string): Promise<{ status: string }>;
}
