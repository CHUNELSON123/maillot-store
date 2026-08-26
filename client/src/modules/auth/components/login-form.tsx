"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { AuthInput } from "./auth-input";
import { AuthPasswordInput } from "./auth-password-input";

export function LoginForm() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      window.location.href = "/";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-5">
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

        <AuthPasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                setRememberMe(event.target.checked)
              }
              className="h-4 w-4 rounded border-neutral-300 accent-[#D4AF37]"
            />

            <span className="text-neutral-900">
              Remember me
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="font-medium text-blue-700 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-md bg-[#D4AF37] px-6 text-sm font-semibold text-white transition hover:bg-[#bf9828] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
        </button>

        <div className="flex items-center gap-4 py-1">
          <div className="h-px flex-1 bg-neutral-200" />

          <span className="text-sm text-neutral-500">
            OR
          </span>

          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="text-center">
          <p className="mb-3 text-sm text-neutral-900">
            Don&apos;t have an account?
          </p>

          <Link
            href="/register"
            className="flex h-11 w-full items-center justify-center rounded-md border border-neutral-500 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            CREATE ACCOUNT
          </Link>
        </div>
      </div>
    </form>
  );
}