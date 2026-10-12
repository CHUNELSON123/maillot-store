
import { Suspense } from "react";
import { AuthPageLayout } from "@/modules/auth/components/auth-page-layout";
import { RegisterForm } from "@/modules/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="CREATE ACCOUNT"
      description={
        <>
          Join Maillot Store and start
          <br />
          shopping.
        </>
      }
      form={
        <Suspense
          fallback={
            <div className="py-8 text-center text-sm text-neutral-500">
              Loading registration form...
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      }
      imageSrc="/login-image.png"
      imageAlt="Join the Maillot Store family"
    />
  );
}
