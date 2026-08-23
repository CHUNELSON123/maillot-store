import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../../domain/repositories/customer.repository';

@Injectable()
export class GetCustomerProfileUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(userId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}
