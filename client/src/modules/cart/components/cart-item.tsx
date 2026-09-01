"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { CartItem as CartItemType } from "../types/cart.types";

type CartItemProps = {
  item: CartItemType;
  onQuantityChange: (
    quantity: number,
  ) => void;
  onRemove: () => void;
};

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const itemTotal =
    item.product.price * item.quantity;

  return (
    <div className="grid grid-cols-1 gap-4 border-t border-neutral-200 py-5 sm:grid-cols-[1fr_130px_110px_120px] sm:items-center sm:gap-4">
      {/* Product */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative h-[100px] w-[90px] shrink-0 overflow-hidden rounded-[3px] border border-neutral-200 bg-neutral-50">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.product.name}
              fill
              sizes="90px"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[8px] text-neutral-400">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-[12px] font-bold sm:text-[13px]">
            {item.product.name}
          </h3>

          {item.variant?.size && (
            <p className="mt-2 text-[10px]">
              <span className="font-semibold">
                Size:
              </span>{" "}
              {item.variant.size}
            </p>
          )}

          {item.variant?.color && (
            <p className="mt-1 text-[10px]">
              <span className="font-semibold">
                Color:
              </span>{" "}
              {item.variant.color}
            </p>
          )}

          <p className="mt-2 text-[10px] font-semibold text-green-600">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-600" />
            In Stock
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="hidden text-[12px] sm:block">
        {item.product.price.toLocaleString()} XAF
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-between sm:block">
        <span className="text-[10px] font-semibold sm:hidden">
          Quantity
        </span>

        <div className="flex h-10 w-[110px] items-center justify-between rounded-[5px] border border-neutral-300 px-3">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() =>
              onQuantityChange(
                item.quantity - 1,
              )
            }
            className="text-neutral-700 transition hover:text-[#D4AF37]"
          >
            <Minus size={14} />
          </button>

          <span className="text-[12px] font-semibold">
            {item.quantity}
          </span>

          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() =>
              onQuantityChange(
                item.quantity + 1,
              )
            }
            className="text-neutral-700 transition hover:text-[#D4AF37]"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between sm:block">
        <span className="text-[10px] font-semibold sm:hidden">
          Total
        </span>

        <div>
          <p className="text-[12px] font-bold">
            {itemTotal.toLocaleString()} XAF
          </p>

          <button
            type="button"
            onClick={onRemove}
            className="mt-2 flex items-center gap-1 text-[9px] text-red-600 transition hover:text-red-800"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}