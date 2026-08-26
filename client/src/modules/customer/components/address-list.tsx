"use client";

import { useEffect, useState } from "react";
import { AddressCard } from "./address-card";
import { AddressForm } from "./address-form";
import { useCustomer } from "../hooks/use-customer";
import {
  CustomerAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from "../types/customer.types";

export function AddressList() {
  const {
    addresses,
    isLoading,
    error,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  } = useCustomer();

  const [editingAddress, setEditingAddress] =
    useState<CustomerAddress | null>(null);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    void getAddresses();
  }, [getAddresses]);

  const handleSubmit = async (
    data:
      | CreateCustomerAddressRequest
      | UpdateCustomerAddressRequest,
  ) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await createAddress(
        data as CreateCustomerAddressRequest,
      );
    }

    setEditingAddress(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) {
      return;
    }

    await deleteAddress(id);
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="h-11 rounded-md bg-[#D4AF37] px-6 text-sm font-semibold text-white hover:bg-[#bf9828]"
        >
          ADD NEW ADDRESS
        </button>
      )}

      {showForm && (
        <AddressForm
          address={editingAddress}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditingAddress(null);
            setShowForm(false);
          }}
        />
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!showForm && (
        <div className="space-y-4">
          {addresses.length === 0 && !isLoading ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-sm text-neutral-500">
                You have no saved addresses yet.
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={(selectedAddress) => {
                  setEditingAddress(selectedAddress);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}