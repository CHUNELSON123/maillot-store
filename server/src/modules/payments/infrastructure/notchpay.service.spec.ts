import { NotchPayService } from './notchpay.service';

jest.mock('../../../infrastructure/database/prisma.service', () => ({ PrismaService: class {} }));

describe('Notch Pay sandbox checkout', () => {
  const order = { id: 'order-id', status: 'PENDING', guestEmail: 'guest@example.com', payment: { id: 'payment-id', amount: 1050, status: 'PENDING', paymentMethod: 'MTN Mobile Money' } };
  const dto = { orderId: 'order-id', guestAccessToken: 'a'.repeat(64) };
  let prisma: { payment: { findFirst: jest.Mock; updateMany: jest.Mock } };
  let orders: { executeGuest: jest.Mock; execute: jest.Mock };
  let payments: { updateStatus: jest.Mock };
  let service: NotchPayService;
  const oldEnv = { ...process.env };
  const oldFetch = global.fetch;
  beforeEach(() => {
    process.env.NOTCHPAY_MODE = 'sandbox';
    process.env.NOTCHPAY_PUBLIC_KEY = 'pk_test.example';
    process.env.NOTCHPAY_CALLBACK_URL = 'http://localhost:3000/payment-result';
    prisma = { payment: { findFirst: jest.fn().mockResolvedValue({ id: 'payment-id', amount: 1050, status: 'PENDING', transaction_reference: 'trx.ref' }), updateMany: jest.fn().mockResolvedValue({ count: 1 }) } };
    orders = { executeGuest: jest.fn().mockResolvedValue(order), execute: jest.fn().mockResolvedValue(order) };
    payments = { updateStatus: jest.fn() };
    service = new NotchPayService(prisma as never, orders as never, payments as never);
  });
  afterAll(() => { process.env = oldEnv; global.fetch = oldFetch; });

  it('starts an owned order with the stored amount and sandbox operator', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ authorization_url: 'https://pay.notchpay.co/pay_123', transaction: { reference: 'trx.ref' } }) });
    await expect(service.initialize(dto)).resolves.toEqual({ authorizationUrl: 'https://pay.notchpay.co/pay_123' });
    const options = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(JSON.parse(options.body)).toEqual(expect.objectContaining({ amount: 1050, currency: 'XAF', locked_channel: 'cm.mtn' }));
    expect(orders.executeGuest).toHaveBeenCalledWith(dto.orderId, dto.guestAccessToken);
  });

  it('records payment only after provider verification matches the stored reference and amount', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ transaction: { reference: 'trx.ref', amount: 1050, currency: 'XAF', status: 'complete' } }) });
    await expect(service.verify(dto)).resolves.toEqual({ status: 'PAID' });
    expect(payments.updateStatus).toHaveBeenCalledWith('payment-id', { status: 'PAID', transactionReference: 'trx.ref' });
  });

  it('does not mark paid when the verified amount differs', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ transaction: { reference: 'trx.ref', amount: 10, currency: 'XAF', status: 'complete' } }) });
    await expect(service.verify(dto)).rejects.toThrow('Payment details could not be verified');
    expect(payments.updateStatus).not.toHaveBeenCalled();
  });

  it('allows a new attempt only when the provider confirms the previous one failed', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ transaction: { reference: 'trx.ref', amount: 1050, currency: 'XAF', status: 'failed' } }) });
    await expect(service.verify(dto)).resolves.toEqual({ status: 'FAILED' });
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({ where: { id: 'payment-id', status: 'PENDING', transaction_reference: 'trx.ref' }, data: { transaction_reference: null } });
    expect(payments.updateStatus).not.toHaveBeenCalled();
  });

  it('rejects a live key even if sandbox mode is selected', async () => {
    process.env.NOTCHPAY_PUBLIC_KEY = 'pk_live_example';
    await expect(service.initialize(dto)).rejects.toThrow('Sandbox payments are not configured');
    expect(prisma.payment.updateMany).not.toHaveBeenCalled();
  });

  it('sends the selected mobile money number and operator to the provider for the saved order', async () => {
    const tx = { $queryRaw: jest.fn(), order: { findFirst: jest.fn().mockResolvedValue({ total_amount: 1050, payment: null }) }, paymentMethod: { findFirst: jest.fn().mockResolvedValue({ id: 'method-id' }) }, payment: { create: jest.fn() } };
    const db = { ...prisma, $transaction: (fn: (value: typeof tx) => unknown) => fn(tx) };
    const direct = new NotchPayService(db as never, orders as never, payments as never);
    jest.spyOn(direct, 'initialize').mockResolvedValue({ authorizationUrl: 'https://pay.notchpay.co/example' });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    await expect(direct.charge({ ...dto, method: 'mtn', phone: '+237670000000' })).resolves.toEqual({ status: 'PROCESSING' });
    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[0]).toBe('https://api.notchpay.co/payments/trx.ref');
    expect(JSON.parse(call[1].body)).toEqual({ channel: 'cm.mtn', data: { phone: '+237670000000', account_number: '+237670000000', country: 'CM' } });
    expect(tx.payment.create).toHaveBeenCalledWith({ data: expect.objectContaining({ order_id: 'order-id', amount: 1050, status: 'PENDING' }) });
  });
});
