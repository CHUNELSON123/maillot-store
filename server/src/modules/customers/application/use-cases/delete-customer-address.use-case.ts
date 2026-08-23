import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../../domain/repositories/customer.repository';

@Injectable()
export class DeleteCustomerAddressUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(userId: string, addressId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.customerRepository.deleteAddress(customer.id, addressId);

    return {
      message: 'Customer address deleted successfully',
    };
  }
}
