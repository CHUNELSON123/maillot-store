"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Home, Lock } from "lucide-react";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { NewsletterSection } from "@/components/shared/newsletter-section";
import { authStorage } from "@/lib/auth/auth-storage";
import { apiClient } from "@/services/api/api-client";
import { useCart } from "../../hooks/use-cart";
import { ProductVariant } from "@/modules/catalogue/types/catalogue.types";

import { CheckoutAccountPrompt } from "@/modules/checkout/components/checkout-account-prompt";
import { CheckoutContactForm } from "./checkout-contact-form";
import { CheckoutDeliveryForm } from "./checkout-delivery-form";
import { CheckoutPaymentMethods } from "./checkout-payment-methods";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { orderConfirmationStorage } from "@/modules/orders/services/order-confirmation-storage";

export type DeliveryMethod =
  | "delivery"
  | "pickup";

export type PaymentMethod =
  | "mtn"
  | "orange"
  | "card"
  | "cash";

export function CheckoutPageContent() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    clearCart,
    updateVariant,
  } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mtn");

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showAccountPrompt, setShowAccountPrompt] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleVariantChange = useCallback(
    (itemId: string, variant: ProductVariant) => {
      updateVariant(itemId, variant);
      setErrorMessage("");
    },
    [updateVariant],
  );

  const actualDeliveryFee =
    deliveryMethod === "delivery"
      ? deliveryFee
      : 0;

  const actualTotal =
    subtotal + actualDeliveryFee;

  const validateCheckout = () => {
    if (items.length === 0) {
      setErrorMessage(
        "Your cart is empty.",
      );
      return false;
    }

    if (!fullName.trim()) {
      setErrorMessage(
        "Please enter your full name.",
      );
      return false;
    }

    if (!phone.trim()) {
      setErrorMessage(
        "Please enter your phone number.",
      );
      return false;
    }

    if (!email.trim()) {
      setErrorMessage(
        "Please enter your email address.",
      );
      return false;
    }

    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {
      setErrorMessage(
        "Please enter a valid email address.",
      );
      return false;
    }

    if (
      deliveryMethod === "delivery" &&
      (!address.trim() || !city.trim())
    ) {
      setErrorMessage(
        "Please provide your delivery address and city.",
      );
      return false;
    }

    if (!termsAccepted) {
      setErrorMessage(
        "Please accept the Terms & Conditions.",
      );
      return false;
    }

    const itemWithoutVariant = items.find(
      (item) => !item.variant?.id,
    );

    if (itemWithoutVariant) {
      setErrorMessage(
        `Please select a variant for ${itemWithoutVariant.product.name} before checkout.`,
      );
      return false;
    }

    return true;
  };

  const submitOrder = async () => {
    if (!validateCheckout()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = authStorage.getToken();

      const response = await apiClient<{
        id: string;
        orderNumber: string;
      }>("/orders", {
        method: "POST",
        ...(token ? { token } : {}),
        body: JSON.stringify({
          source: "WEBSITE",

          items: items.map((item) => ({
            variantId: item.variant!.id,
            quantity: item.quantity,
          })),

          guestName: token
            ? undefined
            : fullName.trim(),

          guestEmail: token
            ? undefined
            : email.trim(),

          guestPhone: token
            ? undefined
            : phone.trim(),
        }),
      });

      orderConfirmationStorage.save({
  id: response.id,
  orderNumber: response.orderNumber,
  orderDate: new Date().toISOString(),

  customer: {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
  },

  delivery: {
    method: deliveryMethod,
    address: address.trim(),
    city: city.trim(),
    postalCode: postalCode.trim(),
  },

  paymentMethod,

  items: items.map((item) => ({
    id: item.id,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
    },
    variant: item.variant
      ? {
          id: item.variant.id,
          size: item.variant.size,
          color: item.variant.color,
          sku: item.variant.sku,
        }
      : null,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
  })),

  subtotal,
  deliveryFee: actualDeliveryFee,
  total: actualTotal,
});

clearCart();

window.location.href = "/order-confirmed";
    } catch (error) {
      console.error(
        "Order creation failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to place your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!validateCheckout()) {
      return;
    }

    const token = authStorage.getToken();

    if (!token) {
      setShowAccountPrompt(true);
      return;
    }

    void submitOrder();
  };

  const handleContinueAsGuest = () => {
    setShowAccountPrompt(false);
    void submitOrder();
  };

  return (
    <CustomerLayout>
      <main className="min-h-screen bg-white text-neutral-950">
        <section className="mx-auto max-w-[1200px] px-5 pb-0 pt-4 sm:px-8 lg:px-5">
          <div className="flex items-center gap-2 text-[9px]">
            <Link
              href="/"
              className="flex items-center gap-1.5 transition hover:text-[#D4AF37]"
            >
              <Home size={11} />
              Home
            </Link>

            <span className="text-neutral-400">
              ›
            </span>

            <Link
              href="/cart"
              className="transition hover:text-[#D4AF37]"
            >
              Cart
            </Link>

            <span className="text-neutral-400">
              ›
            </span>

            <span className="font-semibold">
              Checkout
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-[25px] font-extrabold uppercase tracking-tight sm:text-[28px]">
              CHECKOUT
            </h1>

            <p className="mt-0.5 text-[11px] text-neutral-600 sm:text-[12px]">
              Please fill in the information below to complete your order.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
              <h2 className="text-[18px] font-extrabold uppercase">
                YOUR CART IS EMPTY
              </h2>

              <p className="mt-2 text-[11px] text-neutral-500">
                Add products to your cart before checking out.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-flex h-10 items-center justify-center bg-[#D4AF37] px-8 text-[10px] font-extrabold uppercase text-black transition hover:bg-[#c49f25]"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_390px]">
              <div className="min-w-0 rounded-[8px] border border-neutral-200 px-4 py-3 sm:px-5">
                <CheckoutContactForm
                  fullName={fullName}
                  phone={phone}
                  email={email}
                  onFullNameChange={setFullName}
                  onPhoneChange={setPhone}
                  onEmailChange={setEmail}
                />

                <CheckoutDeliveryForm
                  deliveryMethod={deliveryMethod}
                  onDeliveryMethodChange={
                    setDeliveryMethod
                  }
                  address={address}
                  city={city}
                  postalCode={postalCode}
                  onAddressChange={setAddress}
                  onCityChange={setCity}
                  onPostalCodeChange={
                    setPostalCode
                  }
                />

                <CheckoutPaymentMethods
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={
                    setPaymentMethod
                  }
                  termsAccepted={termsAccepted}
                  onTermsChange={setTermsAccepted}
                />

                {errorMessage && (
                  <div className="mt-3 rounded-[4px] border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="button"
                  disabled={
                    !termsAccepted ||
                    isSubmitting
                  }
                  onClick={handlePlaceOrder}
                  className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-[4px] bg-[#D4AF37] text-[10px] font-extrabold uppercase text-black transition hover:bg-[#c49f25] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock size={13} />

                  {isSubmitting
                    ? "PROCESSING..."
                    : "PLACE ORDER"}
                </button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-neutral-600">
                  <Lock size={11} />
                  Your payment is secure and encrypted
                </div>
              </div>

              <div className="lg:sticky lg:top-4 lg:self-start">
                <CheckoutOrderSummary
                  items={items}
                  itemCount={itemCount}
                  subtotal={subtotal}
                  deliveryFee={actualDeliveryFee}
                  total={actualTotal}
                  onVariantChange={handleVariantChange}
                />
              </div>
            </div>
          )}
        </section>

        <NewsletterSection />

        {showAccountPrompt && (
          <CheckoutAccountPrompt
            onContinueAsGuest={
              handleContinueAsGuest
            }
            onClose={() =>
              setShowAccountPrompt(false)
            }
          />
        )}
      </main>
    </CustomerLayout>
  );
}
