export interface Customer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  address: string;
  city: string;
  region: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateCustomerAddressRequest {
  address: string;
  city: string;
  region?: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateCustomerAddressRequest {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  isDefault?: boolean;
}