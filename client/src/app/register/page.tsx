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
      form={<RegisterForm />}
      imageSrc="/login-image.png"
      imageAlt="Join the Maillot Store family"
    />
  );
}