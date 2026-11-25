import { WhatsAppNotificationService } from './whatsapp-notification.service';

describe('WhatsAppNotificationService', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, WHATSAPP_MODE: 'mock' };
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('logs a local mock and does not contact Meta', async () => {
    const service = new WhatsAppNotificationService();
    const log = jest.spyOn((service as unknown as { logger: { log: (message: string) => void } }).logger, 'log').mockImplementation();

    await service.notifyNewsletterSubscriber('+237 600 000 000');

    expect(log).toHaveBeenCalledWith(expect.stringContaining('[MOCK WhatsApp newsletter subscription]'));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sends the approved template through the configured Cloud API endpoint', async () => {
    process.env.WHATSAPP_MODE = 'live';
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
    process.env.WHATSAPP_GRAPH_API_VERSION = 'v99.0';
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.MockedFunction<typeof fetch>;
    const service = new WhatsAppNotificationService();

    await service.notifyInfluencerApproved('+237 600 000 000', 'Alex', 'https://example.test/portal');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v99.0/123456/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: expect.stringContaining('influencer_approved'),
      }),
    );
  });

  it('normalizes a local Cameroon number and sends no empty template components', async () => {
    process.env.WHATSAPP_MODE = 'cloud';
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
    process.env.WHATSAPP_GRAPH_API_VERSION = 'v99.0';
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.MockedFunction<typeof fetch>;
    await new WhatsAppNotificationService().notifyNewsletterSubscriber('670000000');
    const payload = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(payload.to).toBe('237670000000');
    expect(payload.template.components).toBeUndefined();
  });

  it('does not contact Meta for malformed phone numbers', async () => {
    await new WhatsAppNotificationService().notifyNewsletterSubscriber('123');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('does not throw when Meta is unreachable', async () => {
    process.env.WHATSAPP_MODE = 'cloud';
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456';
    process.env.WHATSAPP_GRAPH_API_VERSION = 'v99.0';
    global.fetch = jest.fn().mockRejectedValue(new Error('network failed')) as jest.MockedFunction<typeof fetch>;
    await expect(new WhatsAppNotificationService().notifyNewsletterSubscriber('+237670000000')).resolves.toBeUndefined();
  });
});
