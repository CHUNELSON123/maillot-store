"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCustomer } from "../hooks/use-customer";

export function AccountDashboard() {
  const {
    customer,
    isLoading,
    error,
    getProfile,
  } = useCustomer();

  useEffect(() => {
    void getProfile();
  }, [getProfile]);

  if (isLoading && !customer) {
    return (
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Account Dashboard
          </h1>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-8">
          <p className="text-sm text-neutral-500">
            Loading your account...
          </p>
        </div>
      </section>
    );
  }

  if (error && !customer) {
    return (
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Account Dashboard
          </h1>
        </div>

        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Account Dashboard
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Welcome back
          {customer?.firstName
            ? `, ${customer.firstName}`
            : ""}
          .
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">
            Customer
          </p>

          <h2 className="mt-2 text-lg font-semibold text-neutral-900">
            {customer
              ? `${customer.firstName} ${customer.lastName}`
              : "Customer"}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {customer?.phone || "No phone number added"}
          </p>

          <Link
            href="/account/profile"
            className="mt-5 inline-block text-sm font-semibold text-[#8f741d] hover:underline"
          >
            VIEW PROFILE
          </Link>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">
            Delivery Addresses
          </p>

          <h2 className="mt-2 text-lg font-semibold text-neutral-900">
            Manage your addresses
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Add or update your delivery information.
          </p>

          <Link
            href="/account/addresses"
            className="mt-5 inline-block text-sm font-semibold text-[#8f741d] hover:underline"
          >
            MANAGE ADDRESSES
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">
          My Orders
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Your orders and order tracking will appear here
          once the Orders module is connected.
        </p>

        <Link
          href="/account/orders"
          className="mt-5 inline-block text-sm font-semibold text-[#8f741d] hover:underline"
        >
          VIEW MY ORDERS
        </Link>
      </div>
    </section>
  );
}