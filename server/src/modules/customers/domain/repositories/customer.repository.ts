import { CustomerEntity } from '../entities/customer.entity';
import { CustomerAddressEntity } from '../entities/customer-address.entity';

export interface UpdateCustomerProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateCustomerAddressData {
  customerId: string;
  address: string;
  city: string;
  region?: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateCustomerAddressData {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  isDefault?: boolean;
}

export abstract class CustomerRepository {
  abstract findByUserId(userId: string): Promise<CustomerEntity | null>;

  abstract updateProfile(
    customerId: string,
    data: UpdateCustomerProfileData,
  ): Promise<CustomerEntity>;

  abstract findAddresses(customerId: string): Promise<CustomerAddressEntity[]>;

  abstract createAddress(
    data: CreateCustomerAddressData,
  ): Promise<CustomerAddressEntity>;

  abstract updateAddress(
    customerId: string,
    addressId: string,
    data: UpdateCustomerAddressData,
  ): Promise<CustomerAddressEntity>;

  abstract deleteAddress(customerId: string, addressId: string): Promise<void>;
}
