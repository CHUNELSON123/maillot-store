import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateCustomerAddressData,
  CustomerRepository,
} from '../../domain/repositories/customer.repository';

@Injectable()
export class CreateCustomerAddressUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    userId: string,
    data: Omit<CreateCustomerAddressData, 'customerId'>,
  ) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.customerRepository.createAddress({
      ...data,
      customerId: customer.id,
    });
  }
}
