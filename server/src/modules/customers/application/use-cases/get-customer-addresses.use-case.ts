import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../../domain/repositories/customer.repository';

@Injectable()
export class GetCustomerAddressesUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(userId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.customerRepository.findAddresses(customer.id);
  }
}
