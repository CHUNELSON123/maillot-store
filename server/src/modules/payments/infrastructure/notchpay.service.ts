import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { GetOrderUseCase } from '../../orders/application/use-cases/get-order.use-case';
import { PaymentRepository } from '../domain/repositories/payment.repository';
import { MobileMoneyCheckoutDto, NotchCheckoutDto } from '../presentation/dto/notch-checkout.dto';

@Injectable()
export class NotchPayService {
  constructor(private readonly prisma: PrismaService, private readonly orders: GetOrderUseCase, private readonly payments: PaymentRepository) {}

  private key() {
    const key = process.env.NOTCHPAY_PUBLIC_KEY?.trim();
    if (process.env.NOTCHPAY_MODE !== 'sandbox' || !key || !/^pk_test[._][a-zA-Z0-9]/.test(key)) throw new ServiceUnavailableException('Sandbox payments are not configured. Set NOTCHPAY_MODE=sandbox and provide a Notch Pay test public key.');
    return key;
  }

  private async ownedOrder(dto: NotchCheckoutDto, userId?: string) {
    if (userId) return this.orders.execute(userId, dto.orderId);
    if (!dto.guestAccessToken) throw new BadRequestException('Guest order access is required.');
    return this.orders.executeGuest(dto.orderId, dto.guestAccessToken);
  }

  async selectCash(dto: NotchCheckoutDto, userId?: string) {
    const order = await this.ownedOrder(dto, userId);
    await this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id}::uuid FOR UPDATE`;
      const current = await tx.order.findFirst({ where: { id: order.id, status: 'PENDING', deleted_at: null }, include: { payment: true } });
      if (!current) throw new ConflictException('This order cannot be paid.');
      const method = await tx.paymentMethod.findFirst({ where: { name: 'Cash Before Delivery', is_active: true, deleted_at: null } });
      if (!method) throw new BadRequestException('Cash is not available.');
      if (current.payment) {
        if (current.payment.status !== 'PENDING' || current.payment.transaction_reference) throw new ConflictException('A payment is already being processed. Check its status.');
        await tx.payment.update({ where: { id: current.payment.id }, data: { payment_method_id: method.id } });
      } else await tx.payment.create({ data: { order_id: order.id, payment_method_id: method.id, amount: current.total_amount, status: 'PENDING' } });
    });
    return { status: 'PENDING' };
  }

  async charge(dto: MobileMoneyCheckoutDto, userId?: string) {
    const key = this.key();
    const order = await this.ownedOrder(dto, userId);
    if (order.status !== 'PENDING') throw new ConflictException('This order cannot be paid.');
    const methodName = dto.method === 'mtn' ? 'MTN Mobile Money' : 'Orange Money';
    const channel = dto.method === 'mtn' ? 'cm.mtn' : 'cm.orange';
    await this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id}::uuid FOR UPDATE`;
      const currentOrder = await tx.order.findFirst({ where: { id: order.id, status: 'PENDING', deleted_at: null }, include: { payment: true } });
      if (!currentOrder) throw new ConflictException('This order cannot be paid.');
      const method = await tx.paymentMethod.findFirst({ where: { name: methodName, is_active: true, deleted_at: null } });
      if (!method) throw new BadRequestException('Selected payment method is unavailable.');
      if (currentOrder.payment) {
        if (currentOrder.payment.status !== 'PENDING' || currentOrder.payment.transaction_reference) throw new ConflictException('A payment for this order is already being processed. Check its status.');
        await tx.payment.update({ where: { id: currentOrder.payment.id }, data: { payment_method_id: method.id } });
      } else {
        await tx.payment.create({ data: { order_id: order.id, payment_method_id: method.id, amount: currentOrder.total_amount, status: 'PENDING' } });
      }
    });
    const initialized = await this.initialize(dto, userId);
    const fresh = await this.ownedOrder(dto, userId);
    const payment = fresh.payment && await this.prisma.payment.findFirst({ where: { id: fresh.payment.id, deleted_at: null } });
    if (!payment?.transaction_reference || payment.transaction_reference.startsWith('notch-init:') || fresh.payment?.paymentMethod !== methodName) throw new ConflictException('Payment could not be started. Check its status.');
    try {
      const response = await fetch(`https://api.notchpay.co/payments/${encodeURIComponent(payment.transaction_reference)}`, { method: 'POST', headers: { Authorization: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ channel, data: { phone: dto.phone, account_number: dto.phone, country: 'CM' } }) });
      if (!response.ok) throw new Error('Provider rejected the charge');
    } catch {
      // Do not submit another charge while the provider's response is uncertain.
      throw new ServiceUnavailableException('The payment request could not be confirmed. Check its status before retrying.');
    }
    void initialized;
    return { status: 'PROCESSING' };
  }

  async initialize(dto: NotchCheckoutDto, userId?: string) {
    const key = this.key();
    const order = await this.ownedOrder(dto, userId);
    if (!order.payment || order.payment.status !== 'PENDING' || order.status === 'CANCELLED') throw new ConflictException('This order cannot be paid.');
    const channels: Record<string, string> = { 'MTN Mobile Money': 'cm.mtn', 'Orange Money': 'cm.orange' };
    const channel = channels[order.payment.paymentMethod];
    if (!channel) throw new BadRequestException('This payment method does not use Notch Pay.');
    const email = order.guestEmail || dto.email;
    if (!email) throw new BadRequestException('An email address is required to start payment.');
    const amount = order.payment.amount;
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new BadRequestException('The order amount must be a positive whole number in XAF.');
    const callback = process.env.NOTCHPAY_CALLBACK_URL?.trim();
    let url: URL;
    try { url = new URL(callback || ''); } catch { throw new ServiceUnavailableException('Set NOTCHPAY_CALLBACK_URL to the storefront payment-result page.'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new ServiceUnavailableException('Invalid payment callback URL.');

    // Claim initialization before contacting the provider, so simultaneous requests cannot create multiple payments.
    const claim = `notch-init:${randomUUID()}`;
    const claimed = await this.prisma.payment.updateMany({ where: { id: order.payment.id, status: 'PENDING', transaction_reference: null }, data: { transaction_reference: claim } });
    if (!claimed.count) throw new ConflictException('Payment was already started or needs review. Check the order before trying again.');
    let response: Response;
    try {
      response = await fetch('https://api.notchpay.co/payments', { method: 'POST', headers: { Authorization: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency: 'XAF', email, reference: `order_${order.id}_${randomUUID()}`, callback: url.toString(), locked_channel: channel }) });
    } catch {
      throw new ServiceUnavailableException('The payment provider did not respond. Your order is saved; contact the store before retrying.');
    }
    if (!response.ok) {
      // A rejection is definitive; a server error may have occurred after provider creation.
      if (response.status >= 400 && response.status < 500) await this.prisma.payment.updateMany({ where: { id: order.payment.id, transaction_reference: claim }, data: { transaction_reference: null } });
      throw new ServiceUnavailableException('Notch Pay could not start this payment. Your order is saved; please contact the store.');
    }
    const result = await response.json() as { authorization_url?: unknown; transaction?: { reference?: unknown } };
    const reference = result.transaction?.reference;
    if (typeof reference !== 'string' || !reference || typeof result.authorization_url !== 'string') throw new ServiceUnavailableException('The payment provider returned an incomplete response. Your order is saved; contact the store.');
    let checkout: URL;
    try { checkout = new URL(result.authorization_url); } catch { throw new ServiceUnavailableException('Invalid provider checkout URL.'); }
    if (checkout.protocol !== 'https:' || checkout.hostname !== 'pay.notchpay.co') throw new ServiceUnavailableException('Invalid provider checkout URL.');
    const saved = await this.prisma.payment.updateMany({ where: { id: order.payment.id, status: 'PENDING', transaction_reference: claim }, data: { transaction_reference: reference } });
    if (saved.count !== 1) throw new ConflictException('The order changed while starting payment. Contact the store.');
    return { authorizationUrl: checkout.toString() };
  }

  async verify(dto: NotchCheckoutDto, userId?: string) {
    const key = this.key();
    const order = await this.ownedOrder(dto, userId);
    if (!order.payment) throw new BadRequestException('No payment was found for this order.');
    const payment = await this.prisma.payment.findFirst({ where: { id: order.payment.id, deleted_at: null } });
    const reference = payment?.transaction_reference;
    if (!payment || !reference || reference.startsWith('notch-init:')) throw new ConflictException('No payment is ready to verify.');
    let response: Response;
    try { response = await fetch(`https://api.notchpay.co/payments/${encodeURIComponent(reference)}`, { headers: { Authorization: key } }); }
    catch { throw new ServiceUnavailableException('Unable to verify payment with Notch Pay. Please try again.'); }
    if (!response.ok) throw new ServiceUnavailableException('Unable to verify payment with Notch Pay. Please try again.');
    const result = await response.json() as { transaction?: { reference?: unknown; amount?: unknown; currency?: unknown; status?: unknown } };
    const transaction = result.transaction;
    if (!transaction || transaction.reference !== reference || Number(transaction.amount) !== Number(payment.amount) || transaction.currency !== 'XAF') throw new ConflictException('Payment details could not be verified. Contact the store.');
    if (transaction.status === 'complete') {
      if (payment.status !== 'PAID') await this.payments.updateStatus(payment.id, { status: 'PAID', transactionReference: reference });
      return { status: 'PAID' };
    }
    if (typeof transaction.status === 'string' && ['failed', 'canceled', 'rejected', 'expired', 'abandoned'].includes(transaction.status)) {
      const cleared = await this.prisma.payment.updateMany({ where: { id: payment.id, status: 'PENDING', transaction_reference: reference }, data: { transaction_reference: null } });
      if (cleared.count === 1) return { status: 'FAILED' };
    }
    return { status: 'PENDING' };
  }
}
