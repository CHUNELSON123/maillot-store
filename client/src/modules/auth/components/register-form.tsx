"use client";

import { useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { AuthInput } from "./auth-input";
import { AuthPasswordInput } from "./auth-password-input";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();

  const { register, isRegistering } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setValidationError(
        "You must agree to the Terms & Conditions.",
      );
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    if (!firstName || !lastName) {
      setValidationError("Please enter your full name.");
      return;
    }

    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      setSuccessMessage(
  "Account created successfully! Redirecting you to sign in..."
);

setTimeout(() => {
  router.push("/login");
}, 1200);

    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthInput
        id="fullName"
        label="Full Name"
        type="text"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Enter your full name"
        required
        icon={<UserRound size={18} />}
      />

      <AuthInput
        id="email"
        label="Email Address"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        autoComplete="email"
        required
        icon={<Mail size={18} />}
      />

      <AuthInput
        id="phone"
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Enter your phone number"
        autoComplete="tel"
        required
        icon={<Phone size={18} />}
      />

      <AuthPasswordInput
        id="password"
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Create a password"
        autoComplete="new-password"
        required
      />

      <AuthPasswordInput
        id="confirmPassword"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(event) =>
          setConfirmPassword(event.target.value)
        }
        placeholder="Confirm your password"
        autoComplete="new-password"
        required
      />

      <label className="flex items-start gap-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(event) =>
            setAgreeToTerms(event.target.checked)
          }
          className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
        />

        <span>
          I agree to the{" "}
          <Link
            href="/terms"
            className="font-medium text-blue-700 hover:underline"
          >
            Terms & Conditions
          </Link>
        </span>
      </label>

      {validationError && (
        <p className="text-sm text-red-600">
          {validationError}
        </p>
      )}

      {successMessage && (
  <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
    {successMessage}
  </div>
)}

      <button
        type="submit"
        disabled={isRegistering}
        className="h-12 w-full rounded-md bg-[#D4AF37] text-sm font-semibold text-white transition hover:bg-[#bf9828] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRegistering
          ? "CREATING ACCOUNT..."
          : "CREATE ACCOUNT"}
      </button>

      <p className="text-center text-sm text-neutral-700">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-700 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}