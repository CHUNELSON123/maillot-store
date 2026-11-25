"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
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
import { useCms } from "@/modules/cms/hooks/use-cms";
import { getProductPromotion } from "@/modules/cms/utils/promotion-pricing";
import { buyNowStorage } from "@/modules/cart/services/buy-now-storage";

type Props = {
  product: ProductDetailsType;
};

export function ProductDetails({ product }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState(product.edition ?? "");
  const [selectedSize, setSelectedSize] = useState(product.variants?.find((variant) => variant.status === "ACTIVE" && variant.stockQuantity > 0)?.size ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [wishlistError, setWishlistError] = useState("");
  const [activeTab, setActiveTab] = useState("Description");
  const { toggleItem, isInWishlist } = useWishlist();
  const { promotions, content } = useCms();

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

  const sizes = [...new Set(
    variants
      .map((variant) => variant.size)
      .filter((value): value is string => Boolean(value)),
  )];

  const hasAvailableSize = (size: string) =>
    purchasableVariants.some((variant) => variant.size === size &&
      (editions.length <= 1 || !selectedEdition || variant.edition === selectedEdition));

  const selectedVariant = purchasableVariants.find(
    (variant) =>
      (!editions.length || editions.length === 1 || variant.edition === selectedEdition) &&
      (!sizes.length || variant.size === selectedSize),
  ) ?? (
    (!editions.length || editions.length === 1) &&
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

  const productPromotion = getProductPromotion({ ...product, price: selectedVariant?.price ?? product.price }, promotions);
  const formattedPrice = new Intl.NumberFormat(
    "en-CM",
    {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    },
  ).format(productPromotion?.discountedPrice ?? selectedVariant?.price ?? product.price);
  const formattedOriginalPrice = productPromotion ? new Intl.NumberFormat('en-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(selectedVariant?.price ?? product.price) : null;
  const editionLabel = product.edition?.trim() && !/^(active|inactive|pending|draft|\d+)$/i.test(product.edition.trim()) ? product.edition.trim() : null;
  const seasonLabel = product.season?.trim() && /^\d{4}\/\d{4}$/.test(product.season.trim()) ? product.season.trim() : null;
  const freeDeliveryThreshold = Number(content["store.free_delivery_threshold"]);
  const deliveryEnabled = content["store.delivery_enabled"] !== "false";

  const handleAddToCart = async (buyNow = false) => {
    if (!selectedVariant || !canPurchase || isAdding) {
      return;
    }

    setIsAdding(true);
    setCartError("");
    setCartMessage("");
    try {
      const purchase = {
        product: { ...product, price: getProductPromotion({ ...product, price: selectedVariant.price }, promotions)?.discountedPrice ?? selectedVariant.price },
        variant: selectedVariant,
        imageUrl: mainImageUrl,
        quantity,
      };
      if (buyNow) {
        buyNowStorage.save({ ...purchase, id: `buy-now-${product.id}-${selectedVariant.id}` });
        router.push("/checkout?mode=buy-now");
      } else {
        await addItem(purchase);
        setCartMessage("Added to your cart.");
      }
    } catch (error) {
      setCartError(error instanceof Error ? error.message : buyNow ? "Unable to start checkout. Please try again." : "Unable to add this product to your cart.");
    } finally {
      setIsAdding(false);
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
                onClick={() => {
                  setWishlistError("");
                  void toggleItem(product, activeImage ?? null).catch((error: unknown) => setWishlistError(error instanceof Error ? error.message : "Unable to update your wishlist."));
                }}
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
                    .slice(0, 4)
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
          <div className="lg:pt-1">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              {product.name}
            </h1>

            {(editionLabel || seasonLabel) && <p className="mt-1 text-sm text-neutral-600">{[editionLabel, seasonLabel].filter(Boolean).join(" ")}</p>}

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-2xl font-bold sm:text-3xl">
                {formattedPrice}
              </span>
              {formattedOriginalPrice && <span className="ml-3 text-sm text-neutral-500 line-through">{formattedOriginalPrice}</span>}
              {productPromotion?.discountPercentage ? <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">-{productPromotion.discountPercentage}%</span> : null}
            </div>

            {/* Stock */}
            <div className={`mt-2 inline-flex items-center gap-1.5 text-sm font-semibold ${purchasableVariants.length > 0 ? "text-green-700" : "text-red-600"}`}>
              <CheckCircle2 size={15} />
              {purchasableVariants.length > 0 ? "In Stock" : "Out of Stock"}
            </div>

            <div className="my-6 h-px bg-neutral-200" />

            {/* Product options */}
            <div className="space-y-5">
              {editions.length > 1 && (
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
                      setSelectedSize("");
                      setQuantity(1);
                    }}
                    className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                  >
                    <option value="">Choose an edition</option>
                    {editions.map((edition) => {
                      const available = purchasableVariants.some((variant) => variant.edition === edition);
                      return (
                        <option key={edition} value={edition} disabled={!available}>
                          {edition}{!available ? " — Unavailable" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-bold">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const available = hasAvailableSize(size);
                      return <button key={size} type="button" disabled={!available} aria-pressed={selectedSize === size} onClick={() => { setSelectedSize(size); setQuantity(1); }} className={`min-h-10 min-w-11 border px-3 text-sm font-semibold transition ${selectedSize === size ? "border-black bg-black text-white" : "border-neutral-300 bg-white text-neutral-900 hover:border-black"} disabled:cursor-not-allowed disabled:opacity-40`}>{size}</button>;
                    })}
                  </div>
                </div>
              )}
            </div>

            {!selectedVariant && (
              <p className="mt-3 text-sm text-neutral-600">
                {purchasableVariants.length === 0
                  ? "This product is currently unavailable."
                  : "Choose an available size to continue."}
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
                disabled={!canPurchase || isAdding}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#D4AF37] text-sm font-bold text-black hover:bg-[#c49d2e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {isAdding ? "ADDING..." : "ADD TO CART"}
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={!canPurchase || isAdding}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap
                  size={18}
                  className="fill-white"
                />
                BUY NOW
              </button>
            </div>
            {cartMessage && <p role="status" className="mt-3 text-sm text-green-700">{cartMessage}</p>}
            {cartError && <p role="alert" className="mt-3 text-sm text-red-700">{cartError}</p>}
            {wishlistError && <p role="alert" className="mt-3 text-sm text-red-700">{wishlistError}</p>}

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-2 gap-y-7 border-b border-neutral-200 pb-7 sm:grid-cols-4">
              <div className="text-center">
                <Truck
                  size={23}
                  className="mx-auto"
                />
                <p className="mt-2 text-xs font-medium">
                  {!deliveryEnabled ? "Store Pickup" : freeDeliveryThreshold > 0 ? `Free over ${freeDeliveryThreshold.toLocaleString()} XAF` : "Delivery Available"}
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
                {["Description", "Details"].map((tab) => (
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
                      <strong>Edition:</strong>{" "}
                      {editionLabel ?? "—"}
                    </p>

                    <p>
                      <strong>Season:</strong>{" "}
                      {seasonLabel ?? "—"}
                    </p>

                    <p>
                      <strong>Available sizes:</strong>{" "}
                      {sizes.join(", ") || "Standard"}
                    </p>
                  </div>
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
  const { promotions } = useCms();

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
              promotions={promotions}
              image={image}
            />
          );
        })}
      </div>
    </section>
  );
}
