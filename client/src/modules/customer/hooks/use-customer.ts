"use client";

import { useCallback, useState } from "react";
import { customerService } from "../services/customer.service";
import {
  Customer,
  CustomerAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
  UpdateCustomerProfileRequest,
} from "../types/customer.types";

export function useCustomer() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await customerService.getProfile();
      setCustomer(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load customer profile.";

      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateCustomerProfileRequest) => {
      setIsLoading(true);
      setError("");

      try {
        const updatedCustomer =
          await customerService.updateProfile(data);

        setCustomer(updatedCustomer);
        return updatedCustomer;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update your profile.";

        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getAddresses = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await customerService.getAddresses();
      setAddresses(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load your addresses.";

      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAddress = useCallback(
    async (data: CreateCustomerAddressRequest) => {
      setIsLoading(true);
      setError("");

      try {
        const address =
          await customerService.createAddress(data);

        setAddresses((current) => [...current, address]);
        return address;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create your address.";

        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateAddress = useCallback(
    async (
      id: string,
      data: UpdateCustomerAddressRequest,
    ) => {
      setIsLoading(true);
      setError("");

      try {
        const updatedAddress =
          await customerService.updateAddress(id, data);

        setAddresses((current) =>
          current.map((address) =>
            address.id === id
              ? updatedAddress
              : address,
          ),
        );

        return updatedAddress;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update your address.";

        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError("");

      try {
        await customerService.deleteAddress(id);

        setAddresses((current) =>
          current.filter(
            (address) => address.id !== id,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to delete your address.";

        setError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    customer,
    addresses,
    isLoading,
    error,
    getProfile,
    updateProfile,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  };
}