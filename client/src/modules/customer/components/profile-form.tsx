"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCustomer } from "../hooks/use-customer";

export function ProfileForm() {
  const {
    customer,
    isLoading,
    error,
    getProfile,
    updateProfile,
  } = useCustomer();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (!customer) {
      return;
    }

    setFirstName(customer.firstName);
    setLastName(customer.lastName);
    setPhone(customer.phone ?? "");
  }, [customer]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSuccess("");

    try {
      await updateProfile({
        firstName,
        lastName,
        phone: phone || undefined,
      });

      setSuccess("Profile updated successfully.");
    } catch {
      // Error is already handled by useCustomer.
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl"
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="firstName"
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            First Name
          </label>

          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(event) =>
              setFirstName(event.target.value)
            }
            required
            minLength={2}
            maxLength={100}
            className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            Last Name
          </label>

          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(event) =>
              setLastName(event.target.value)
            }
            required
            minLength={2}
            maxLength={100}
            className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            minLength={5}
            maxLength={30}
            className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 rounded-md bg-[#D4AF37] px-8 text-sm font-semibold text-white transition hover:bg-[#bf9828] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>
    </form>
  );
}