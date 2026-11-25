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
    <div className="border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-bold text-neutral-900">Delivery Address</h3>

            {address.isDefault && (
              <span className="rounded bg-green-100 px-2 py-1 text-[9px] font-semibold text-green-700">
                Default Address
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-neutral-700">
            {address.address}
          </p>

          <p className="mt-1 text-[10px] text-neutral-500">
            {address.region
              ? `${address.region}, `
              : ""}
            {address.city}, {address.country}
          </p>
        </div>

        <div className="flex shrink-0 gap-2 self-end">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="border border-neutral-300 px-3 py-1.5 text-[10px] font-semibold text-neutral-700 hover:border-[#d28a00]"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(address.id)}
            className="border border-red-200 px-3 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
