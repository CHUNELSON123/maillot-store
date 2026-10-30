"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Headphones,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { useCatalogue } from "../hooks/use-catalogue";
import {
  ProductDetails as ProductDetailsType,
  ProductVariant,
} from "../types/catalogue.types";
import { ProductCard } from "./product-card";
import { NewsletterSection } from "@/components/shared/newsletter-section";

import { useWishlist } from "@/modules/wishlist/hooks/use-wishlist";

type Props = {
  product: ProductDetailsType;
};

export function ProductDetails({ product }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const { toggleItem, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);

  const images = product.images ?? [];
  const variants = product.variants ?? [];

  const purchasableVariants = variants.filter(
    (variant): variant is ProductVariant & { price: number } =>
      variant.status === "ACTIVE" &&
      typeof variant.price === "number" &&
      Number.isFinite(variant.price) &&
      variant.price >= 0 &&
      Number.isFinite(variant.stockQuantity) &&
      variant.stockQuantity > 0,
  );

  const editions = [...new Set(
    variants
      .map((variant) => variant.edition)
      .filter((value): value is string => Boolean(value)),
  )];

  const colors = [...new Set(
    variants
      .map((variant) => variant.color)
      .filter((value): value is string => Boolean(value)),
  )];

  const sizes = [...new Set(
    variants
      .map((variant) => variant.size)
      .filter((value): value is string => Boolean(value)),
  )];

  const hasAvailableCombination = (
    field: "edition" | "color" | "size",
    value: string,
  ) =>
    purchasableVariants.some((variant) => {
      if (variant[field] !== value) return false;

      // Changing edition resets color and size.
      if (field !== "edition" && selectedEdition && variant.edition !== selectedEdition) {
        return false;
      }

      // Changing color resets size.
      if (field === "size" && selectedColor && variant.color !== selectedColor) {
        return false;
      }

      return true;
    });

  const selectedVariant = purchasableVariants.find(
    (variant) =>
      (!editions.length || variant.edition === selectedEdition) &&
      (!colors.length || variant.color === selectedColor) &&
      (!sizes.length || variant.size === selectedSize),
  ) ?? (
    !editions.length &&
    !colors.length &&
    !sizes.length &&
    purchasableVariants.length === 1
      ? purchasableVariants[0]
      : null
  );

  const availableStock = selectedVariant?.stockQuantity ?? 0;
  const canPurchase =
    selectedVariant !== null &&
    quantity >= 1 &&
    quantity <= availableStock;

  const activeImage = images[selectedImage];

  const getImageUrl = (url?: string | null) => {
    if (!url) {
      return null;
    }

    if (url.startsWith("http") || !url.startsWith("/uploads")) {
      return url;
    }

    try {
      const apiOrigin = new URL(
        process.env.NEXT_PUBLIC_API_URL ?? "",
      ).origin;

      return `${apiOrigin}${url}`;
    } catch {
      return url;
    }
  };

  const mainImageUrl = getImageUrl(
    activeImage?.imageUrl,
  );

  const formattedPrice = new Intl.NumberFormat(
    "en-CM",
    {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    },
  ).format(selectedVariant?.price ?? product.price);

  const handleAddToCart = (buyNow = false) => {
    if (!selectedVariant || !canPurchase) {
      return;
    }

    addItem({
      product: { ...product, price: selectedVariant.price },
      variant: selectedVariant,
      imageUrl: mainImageUrl,
      quantity,
    });

    if (buyNow) {
      router.push("/checkout");
    }
  };

  const moveImage = (
    direction: "next" | "previous",
  ) => {
    if (images.length <= 1) {
      return;
    }

    setSelectedImage((current) => {
      if (direction === "next") {
        return current === images.length - 1
          ? 0
          : current + 1;
      }

      return current === 0
        ? images.length - 1
        : current - 1;
    });
  };

  return (
    <CustomerLayout>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <Link
            href="/"
            className="hover:text-black"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/shop"
            className="hover:text-black"
          >
            Shop
          </Link>

          <span>/</span>

          <span className="text-neutral-900">
            {product.name}
          </span>
        </div>
      </div>

      {/* Product */}
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-6 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Product Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50">
              {mainImageUrl ? (
                <Image
                  src={mainImageUrl}
                  alt={
                    activeImage?.altText ||
                    product.name
                  }
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                  No image available
                </div>
              )}

              {product.status === "ACTIVE" && (
                <span className="absolute left-4 top-4 rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-bold text-white">
                  NEW
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  toggleItem(product, activeImage ?? null)
                }
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105"
                aria-label={
                  isFavorite
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={isFavorite}
              >
                <Heart
                  size={22}
                  className={
                    isFavorite
                      ? "fill-[#D4AF37] text-[#D4AF37]"
                      : "text-neutral-700"
                  }
                />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      moveImage("previous")
                    }
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveImage("next")
                    }
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {images.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      moveImage("previous")
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center"
                    aria-label="Previous thumbnail"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                <div className="flex flex-1 gap-3 overflow-hidden">
                  {images
                    .slice(0, 5)
                    .map((image, index) => {
                      const url = getImageUrl(
                        image.imageUrl,
                      );

                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() =>
                            setSelectedImage(index)
                          }
                          className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-neutral-50 ${
                            selectedImage === index
                              ? "border-[#D4AF37]"
                              : "border-transparent"
                          }`}
                        >
                          {url && (
                            <Image
                              src={url}
                              alt={
                                image.altText ||
                                product.name
                              }
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                          )}
                        </button>
                      );
                    })}
                </div>

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      moveImage("next")
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center"
                    aria-label="Next thumbnail"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="lg:pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B58D00]">
              Maillot Store
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex text-[#E6A400]">
                ★★★★★
              </div>

              <span className="text-sm text-neutral-600">
                4.8
              </span>

              <span className="text-sm text-neutral-500">
                124 reviews
              </span>
            </div>

            {/* Price */}
            <div className="mt-5">
              <span className="text-3xl font-bold">
                {formattedPrice}
              </span>
            </div>

            {/* Stock */}
            <div
              className={`mt-2 text-sm font-semibold ${
                !selectedVariant
                  ? "text-neutral-500"
                  : availableStock > 0
                    ? "text-green-700"
                    : "text-red-600"
              }`}
            >
              {!selectedVariant
                ? "Select your product options"
                : `${availableStock} unit(s) available`}
            </div>

            <div className="my-6 h-px bg-neutral-200" />

            {/* Product options */}
            <div className="space-y-5">
              {editions.length > 0 && (
                <div>
                  <label
                    htmlFor="product-edition"
                    className="mb-2 block text-sm font-bold"
                  >
                    Edition
                  </label>
                  <select
                    id="product-edition"
                    value={selectedEdition}
                    onChange={(event) => {
                      setSelectedEdition(event.target.value);
                      setSelectedColor("");
                      setSelectedSize("");
                      setQuantity(1);
                    }}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  >
                    <option value="">Choose an edition</option>
                    {editions.map((edition) => {
                      const available = hasAvailableCombination("edition", edition);
                      return (
                        <option key={edition} value={edition} disabled={!available}>
                          {edition}{!available ? " — Unavailable" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <label
                    htmlFor="product-color"
                    className="mb-2 block text-sm font-bold"
                  >
                    Color
                  </label>
                  <select
                    id="product-color"
                    value={selectedColor}
                    onChange={(event) => {
                      setSelectedColor(event.target.value);
                      setSelectedSize("");
                      setQuantity(1);
                    }}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  >
                    <option value="">Choose a color</option>
                    {colors.map((color) => {
                      const available = hasAvailableCombination("color", color);
                      return (
                        <option key={color} value={color} disabled={!available}>
                          {color}{!available ? " — Unavailable" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <label
                    htmlFor="product-size"
                    className="mb-2 block text-sm font-bold"
                  >
                    Size
                  </label>
                  <select
                    id="product-size"
                    value={selectedSize}
                    onChange={(event) => {
                      setSelectedSize(event.target.value);
                      setQuantity(1);
                    }}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  >
                    <option value="">Choose a size</option>
                    {sizes.map((size) => {
                      const available = hasAvailableCombination("size", size);
                      return (
                        <option key={size} value={size} disabled={!available}>
                          {size}{!available ? " — Unavailable" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {!selectedVariant && (
              <p className="mt-3 text-sm text-neutral-600">
                {purchasableVariants.length === 0
                  ? "This product is currently unavailable."
                  : "Select the available options to continue."}
              </p>
            )}

            {/* Quantity */}
            <div className="mt-7 flex items-center gap-4">
              <span className="text-sm font-bold">Quantity:</span>

              <div className="flex h-10 items-center rounded-md border border-neutral-300">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="flex h-full w-10 items-center justify-center text-lg disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="w-10 text-center text-sm">{quantity}</span>

                <button
                  type="button"
                  disabled={!selectedVariant || quantity >= availableStock}
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(availableStock, current + 1),
                    )
                  }
                  className="flex h-full w-10 items-center justify-center text-lg disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Purchase */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleAddToCart()}
                disabled={!canPurchase}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] text-sm font-bold text-black hover:bg-[#c49d2e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                ADD TO CART
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={!canPurchase}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap
                  size={18}
                  className="fill-white"
                />
                BUY NOW
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-2 gap-y-7 border-b border-neutral-200 pb-7 sm:grid-cols-4">
              <div className="text-center">
                <Truck
                  size={23}
                  className="mx-auto"
                />
                <p className="mt-2 text-xs font-medium">
                  Free Delivery
                </p>
              </div>

              <div className="text-center">
                <ShieldCheck
                  size={23}
                  className="mx-auto"
                />
                <p className="mt-2 text-xs font-medium">
                  Secure Payment
                </p>
              </div>

              <div className="text-center">
                <Headphones
                  size={23}
                  className="mx-auto"
                />
                <p className="mt-2 text-xs font-medium">
                  24/7 Support
                </p>
              </div>

              <div className="text-center">
                <RefreshCcw
                  size={23}
                  className="mx-auto"
                />
                <p className="mt-2 text-xs font-medium">
                  Easy Returns
                </p>
              </div>
            </div>

            {/* Product tabs */}
            <div className="mt-7">
              <div className="flex gap-7 border-b border-neutral-200">
                {[
                  "Description",
                  "Details",
                  "Reviews (124)",
                ].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab)
                    }
                    className={`relative pb-3 text-sm font-bold ${
                      activeTab === tab
                        ? "text-black"
                        : "text-neutral-500"
                    }`}
                  >
                    {tab}

                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-5 text-sm leading-7 text-neutral-700">
                {activeTab === "Description" && (
                  <p>
                    {product.description ||
                      `Show your passion with the ${product.name}. Featuring a classic design, this jersey combines style, comfort and authenticity.`}
                  </p>
                )}

                {activeTab === "Details" && (
                  <div className="space-y-2">
                    <p>
                      <strong>Product:</strong>{" "}
                      {product.name}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {product.status}
                    </p>

                    <p>
                      <strong>Variants:</strong>{" "}
                      {variants.length}
                    </p>
                  </div>
                )}

                {activeTab === "Reviews (124)" && (
                  <p>
                    Reviews will be connected to the
                    Reviews module when implemented.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <RelatedProducts
        currentProductId={product.id}
      />

      {/* Shared Newsletter */}
           <NewsletterSection />
    </CustomerLayout>
  );
}

function RelatedProducts({
  currentProductId,
}: {
  currentProductId: string;
}) {
  return (
    <RelatedProductsContent
      currentProductId={currentProductId}
    />
  );
}

function RelatedProductsContent({
  currentProductId,
}: {
  currentProductId: string;
}) {
  const { products, images } = useCatalogue();

  const relatedProducts = products
    .filter(
      (product) =>
        product.id !== currentProductId,
    )
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          RELATED PRODUCTS
        </h2>

        <div className="mt-3 h-1 w-14 bg-[#D4AF37]" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {relatedProducts.map((product) => {
          const image =
            images.find(
              (item) =>
                item.productId === product.id &&
                item.isPrimary,
            ) ||
            images.find(
              (item) =>
                item.productId === product.id,
            );

          return (
            <ProductCard
              key={product.id}
              product={product}
              image={image}
            />
          );
        })}
      </div>
    </section>
  );
}
