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

  abstract subscribeToNewsletter(contact: { email?: string; phone?: string }, whatsappOptIn?: boolean): Promise<{ status: string }>;
}
