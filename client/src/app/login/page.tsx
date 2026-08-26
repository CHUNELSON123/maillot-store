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
      form={<LoginForm />}
      imageSrc="/login-image.png"
      imageAlt="Maillot Store sports merchandise"
    />
  );
}