import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CustomerRepository,
  UpdateCustomerAddressData,
} from '../../domain/repositories/customer.repository';

@Injectable()
export class UpdateCustomerAddressUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(
    userId: string,
    addressId: string,
    data: UpdateCustomerAddressData,
  ) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.customerRepository.updateAddress(customer.id, addressId, data);
  }
}
