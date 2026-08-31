"use client";

import { use } from "react";
import Link from "next/link";

import { useProduct } from "@/modules/catalogue/hooks/use-catalogue";
import { ProductDetails } from "@/modules/catalogue/components/product-details";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductPage({ params }: Props) {
  const { id } = use(params);

  const {
    product,
    isLoading,
    error,
  } = useProduct(id);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex min-h-[600px] items-center justify-center">
          <p className="text-sm text-neutral-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex min-h-[600px] flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">
            Product not found
          </h1>

          <Link
            href="/shop"
            className="mt-4 text-sm font-semibold text-[#c29300]"
          >
            ← Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  return <ProductDetails product={product} />;
}