
import { Suspense } from "react";
import { AuthPageLayout } from "@/modules/auth/components/auth-page-layout";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="WELCOME BACK"
      description={
        <>
          Sign in to your Maillot Store
          <br />
          account.
        </>
      }
      form={
        <Suspense
          fallback={
            <div className="py-8 text-center text-sm text-neutral-500">
              Loading sign-in form...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      }
      imageSrc="/login-image.png"
      imageAlt="Maillot Store sports merchandise"
    />
  );
}
