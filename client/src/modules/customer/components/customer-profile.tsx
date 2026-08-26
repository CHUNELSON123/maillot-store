import { ProfileForm } from "./profile-form";

export function CustomerProfile() {
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Manage your personal information.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 sm:p-8">
        <ProfileForm />
      </div>
    </section>
  );
}