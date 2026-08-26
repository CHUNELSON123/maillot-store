"use client";

import { CustomerAddress } from "../types/customer.types";

interface AddressCardProps {
  address: CustomerAddress;
  onEdit: (address: CustomerAddress) => void;
  onDelete: (id: string) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-neutral-900">
              {address.city}
            </h3>

            {address.isDefault && (
              <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-medium text-[#8f741d]">
                Default
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-neutral-600">
            {address.address}
          </p>

          <p className="mt-1 text-sm text-neutral-600">
            {address.region
              ? `${address.region}, `
              : ""}
            {address.city}, {address.country}
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="text-sm font-medium text-neutral-700 hover:text-[#8f741d]"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(address.id)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}