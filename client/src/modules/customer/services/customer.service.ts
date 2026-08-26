import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";
import {
  Customer,
  CustomerAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
  UpdateCustomerProfileRequest,
} from "../types/customer.types";

export const customerService = {
  async getProfile(): Promise<Customer> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<Customer>("/customers/profile", {
      method: "GET",
      token,
    });
  },

  async updateProfile(
    data: UpdateCustomerProfileRequest,
  ): Promise<Customer> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<Customer>("/customers/profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    });
  },

  async getAddresses(): Promise<CustomerAddress[]> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<CustomerAddress[]>("/customers/addresses", {
      method: "GET",
      token,
    });
  },

  async createAddress(
    data: CreateCustomerAddressRequest,
  ): Promise<CustomerAddress> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<CustomerAddress>("/customers/addresses", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  async updateAddress(
    id: string,
    data: UpdateCustomerAddressRequest,
  ): Promise<CustomerAddress> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<CustomerAddress>(
      `/customers/addresses/${id}`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify(data),
      },
    );
  },

  async deleteAddress(id: string): Promise<void> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    await apiClient<void>(
      `/customers/addresses/${id}`,
      {
        method: "DELETE",
        token,
      },
    );
  },
};