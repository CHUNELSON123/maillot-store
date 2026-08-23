import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';

import {
  CreateCustomerAddressData,
  CustomerRepository,
  UpdateCustomerAddressData,
  UpdateCustomerProfileData,
} from '../../domain/repositories/customer.repository';

import { CustomerEntity } from '../../domain/entities/customer.entity';
import { CustomerAddressEntity } from '../../domain/entities/customer-address.entity';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!customer) {
      return null;
    }

    return this.toCustomerEntity(customer);
  }

  async updateProfile(
    customerId: string,
    data: UpdateCustomerProfileData,
  ): Promise<CustomerEntity> {
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        deleted_at: null,
      },
    });

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    const customer = await this.prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      },
    });

    return this.toCustomerEntity(customer);
  }

  async findAddresses(customerId: string): Promise<CustomerAddressEntity[]> {
    const addresses = await this.prisma.customerAddress.findMany({
      where: {
        customer_id: customerId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return addresses.map((address) => this.toAddressEntity(address));
  }

  async createAddress(
    data: CreateCustomerAddressData,
  ): Promise<CustomerAddressEntity> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: data.customerId,
        deleted_at: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: {
          customer_id: data.customerId,
          deleted_at: null,
        },
        data: {
          is_default: false,
        },
      });
    }

    const address = await this.prisma.customerAddress.create({
      data: {
        customer_id: data.customerId,
        address: data.address,
        city: data.city,
        region: data.region,
        country: data.country,
        is_default: data.isDefault ?? false,
      },
    });

    return this.toAddressEntity(address);
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    data: UpdateCustomerAddressData,
  ): Promise<CustomerAddressEntity> {
    const existingAddress = await this.prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customer_id: customerId,
        deleted_at: null,
      },
    });

    if (!existingAddress) {
      throw new NotFoundException('Customer address not found');
    }

    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: {
          customer_id: customerId,
          deleted_at: null,
          id: {
            not: addressId,
          },
        },
        data: {
          is_default: false,
        },
      });
    }

    const address = await this.prisma.customerAddress.update({
      where: {
        id: addressId,
      },
      data: {
        address: data.address,
        city: data.city,
        region: data.region,
        country: data.country,
        is_default: data.isDefault,
      },
    });

    return this.toAddressEntity(address);
  }

  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    const existingAddress = await this.prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customer_id: customerId,
        deleted_at: null,
      },
    });

    if (!existingAddress) {
      throw new NotFoundException('Customer address not found');
    }

    await this.prisma.customerAddress.update({
      where: {
        id: addressId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  private toCustomerEntity(customer: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    created_at: Date;
    updated_at: Date;
  }): CustomerEntity {
    return new CustomerEntity(
      customer.id,
      customer.user_id,
      customer.first_name,
      customer.last_name,
      customer.phone,
      customer.created_at,
      customer.updated_at,
    );
  }

  private toAddressEntity(address: {
    id: string;
    customer_id: string;
    address: string;
    city: string;
    region: string | null;
    country: string;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
  }): CustomerAddressEntity {
    return new CustomerAddressEntity(
      address.id,
      address.customer_id,
      address.address,
      address.city,
      address.region,
      address.country,
      address.is_default,
      address.created_at,
      address.updated_at,
    );
  }
}
