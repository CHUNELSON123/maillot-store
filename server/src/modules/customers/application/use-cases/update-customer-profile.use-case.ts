import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CustomerRepository,
  UpdateCustomerProfileData,
} from '../../domain/repositories/customer.repository';

@Injectable()
export class UpdateCustomerProfileUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(userId: string, data: UpdateCustomerProfileData) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.customerRepository.updateProfile(customer.id, data);
  }
}
