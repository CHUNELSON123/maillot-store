"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CustomerAddress,
  CreateCustomerAddressRequest,
  UpdateCustomerAddressRequest,
} from "../types/customer.types";

interface AddressFormProps {
  address?: CustomerAddress | null;
  isLoading: boolean;
  onSubmit: (
    data:
      | CreateCustomerAddressRequest
      | UpdateCustomerAddressRequest,
  ) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({
  address,
  isLoading,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    setStreetAddress(address?.address ?? "");
    setCity(address?.city ?? "");
    setRegion(address?.region ?? "");
    setCountry(address?.country ?? "");
    setIsDefault(address?.isDefault ?? false);
  }, [address]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    await onSubmit({
      address: streetAddress,
      city,
      region: region || undefined,
      country,
      isDefault,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-neutral-200 bg-white p-6 sm:p-8"
    >
      <h2 className="mb-6 text-lg font-semibold text-neutral-900">
        {address ? "Edit Address" : "Add New Address"}
      </h2>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            Address
          </label>

          <input
            id="address"
            type="text"
            value={streetAddress}
            onChange={(event) =>
              setStreetAddress(event.target.value)
            }
            required
            minLength={3}
            maxLength={255}
            className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-neutral-900"
            >
              City
            </label>

            <input
              id="city"
              type="text"
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
              required
              minLength={2}
              maxLength={100}
              className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <label
              htmlFor="region"
              className="mb-2 block text-sm font-medium text-neutral-900"
            >
              Region
            </label>

            <input
              id="region"
              type="text"
              value={region}
              onChange={(event) =>
                setRegion(event.target.value)
              }
              maxLength={100}
              className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="country"
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            Country
          </label>

          <input
            id="country"
            type="text"
            value={country}
            onChange={(event) =>
              setCountry(event.target.value)
            }
            required
            minLength={2}
            maxLength={100}
            className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) =>
              setIsDefault(event.target.checked)
            }
            className="h-4 w-4 rounded border-neutral-300 accent-[#D4AF37]"
          />

          Set as default address
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 rounded-md bg-[#D4AF37] px-6 text-sm font-semibold text-white hover:bg-[#bf9828] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "SAVING..."
              : address
                ? "UPDATE ADDRESS"
                : "ADD ADDRESS"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 rounded-md border border-neutral-300 px-6 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            CANCEL
          </button>
        </div>
      </div>
    </form>
  );
}