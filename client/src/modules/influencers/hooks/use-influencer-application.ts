'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { authService } from '@/modules/auth/services/auth.service';
import { useCustomer } from '@/modules/customer/hooks/use-customer';
import { influencerService } from '../services/influencer.service';
import { InfluencerApplication } from '../types/influencer.types';

const initialValues: InfluencerApplication = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  country: '',
  dateOfBirth: '',
  gender: '',
  city: '',
  occupation: '',
  bio: '',
  applicationNote: '',
  termsAccepted: false,
};

export function useInfluencerApplication() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { getProfile, getAddresses } = useCustomer();
  const [values, setValues] = useState<InfluencerApplication>(initialValues);
  const [isPrefilling, setIsPrefilling] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const prefill = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !user) {
        setIsPrefilling(false);
        return;
      }

      const [customerResult, addressesResult] = await Promise.allSettled([
        getProfile(),
        getAddresses(),
      ]);
      if (cancelled) return;

      const customer = customerResult.status === 'fulfilled' ? customerResult.value : null;
      const addresses = addressesResult.status === 'fulfilled' ? addressesResult.value : [];
      const address = addresses.find((item) => item.isDefault) ?? addresses[0];
      setValues((current) => ({
        ...current,
        email: user.email,
        firstName: customer?.firstName ?? current.firstName,
        lastName: customer?.lastName ?? current.lastName,
        phone: customer?.phone ?? current.phone,
        city: address?.city ?? current.city,
        country: address?.country ?? current.country,
      }));
      setIsPrefilling(false);
    };

    void prefill();
    return () => { cancelled = true; };
  }, [authLoading, getAddresses, getProfile, isAuthenticated, user]);

  const update = (name: keyof InfluencerApplication, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async () => {
  setIsSubmitting(true);
  setError('');

  try {
    await influencerService.register(values);

    // Allow the confirmation page to verify this successful submission.
    window.sessionStorage.setItem(
      'maillot_influencer_application_submitted',
      'true',
    );

    if (!isAuthenticated) {
      try {
        await authService.login({
          email: values.email,
          password: values.password ?? '',
        });
        window.dispatchEvent(new Event('maillot-auth-updated'));
      } catch {
        // Registration succeeded; login failure must not hide confirmation.
      }
    }

    return true;
  } catch (cause) {
    setError(
      cause instanceof Error
        ? cause.message
        : 'We could not submit your application. Please try again.',
    );
    return false;
  } finally {
    setIsSubmitting(false);
  }
};

  return {
    values,
    update,
    isAuthenticated,
    isLoading: authLoading || isPrefilling,
    isSubmitting,
    error,
    setError,
    submit,
  };
}

