import { apiClient } from "@/services/api/api-client";

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const communicationsService = {
  submitContactMessage(data: ContactMessageInput) {
    return apiClient<{ id: string; createdAt: string }>(
      "/communications/contact-messages",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  subscribeToNewsletter(email: string) {
    return apiClient<{ status: string }>(
      "/communications/newsletter/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
  },
};
