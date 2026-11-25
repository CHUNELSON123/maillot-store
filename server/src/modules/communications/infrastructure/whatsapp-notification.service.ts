import { Injectable, Logger } from '@nestjs/common';

type TemplateParameter = { type: 'text'; text: string };

function normalizeRecipient(value: string): string | null {
  const input = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(input)) return null;
  let digits = input.replace(/\D/g, '');
  // Cameroon local mobile numbers are frequently entered without a country code.
  if (!input.startsWith('+') && /^6\d{8}$/.test(digits)) digits = `237${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

@Injectable()
export class WhatsAppNotificationService {
  private readonly logger = new Logger(WhatsAppNotificationService.name);

  async sendTemplate(to: string, templateName: string, parameters: string[], purpose: string): Promise<void> {
    const recipient = normalizeRecipient(to);
    if (!recipient) {
      this.logger.warn(`WhatsApp ${purpose} skipped: recipient number is invalid.`);
      return;
    }

    if (process.env.WHATSAPP_MODE !== 'live' && process.env.WHATSAPP_MODE !== 'cloud') {
      this.logger.log(`[MOCK WhatsApp ${purpose}] template=${templateName}`);
      return;
    }

    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION;
    if (!token || !phoneNumberId || !graphVersion || !templateName) {
      this.logger.error(`WhatsApp ${purpose} not sent: configure access token, phone number ID, Graph API version, and approved template.`);
      return;
    }

    const bodyParameters: TemplateParameter[] = parameters.map((text) => ({ type: 'text', text }));
    if (!/^v\d+\.\d+$/.test(graphVersion) || !/^\d+$/.test(phoneNumberId)) {
      this.logger.error(`WhatsApp ${purpose} not sent: invalid Graph API version or phone number ID.`);
      return;
    }
    let response: Response;
    try {
      response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'template',
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en' },
          ...(bodyParameters.length ? { components: [{ type: 'body', parameters: bodyParameters }] } : {}),
        },
      }),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      this.logger.error(`WhatsApp ${purpose} could not reach Meta.`);
      return;
    }
    if (!response.ok) {
      this.logger.error(`WhatsApp ${purpose} failed (HTTP ${response.status}). Check the Meta configuration and template.`);
    } else {
      this.logger.log(`WhatsApp ${purpose} accepted by Meta.`);
    }
  }

  notifyInfluencerApproved(to: string, firstName: string, dashboardUrl: string) {
    return this.sendTemplate(to, process.env.WHATSAPP_TEMPLATE_INFLUENCER_APPROVED || 'influencer_approved', [firstName, dashboardUrl], 'influencer approval');
  }

  notifyInfluencerRejected(to: string, firstName: string, reason: string) {
    return this.sendTemplate(to, process.env.WHATSAPP_TEMPLATE_INFLUENCER_REJECTED || 'influencer_rejected', [firstName, reason], 'influencer rejection');
  }

  notifyAdminWithdrawal(to: string, influencerName: string, amount: string) {
    return this.sendTemplate(to, process.env.WHATSAPP_TEMPLATE_WITHDRAWAL_REQUEST || 'influencer_withdrawal_request', [influencerName, amount], 'withdrawal request');
  }

  notifyNewsletterSubscriber(to: string) {
    return this.sendTemplate(to, process.env.WHATSAPP_TEMPLATE_NEWSLETTER_WELCOME || 'newsletter_subscription_confirmed', [], 'newsletter subscription');
  }
}
