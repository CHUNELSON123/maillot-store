
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Mail, Phone, UserRound } from 'lucide-react';
import { CustomerLayout } from '@/modules/customer/components/customer-layout';
import { NewsletterSection } from '@/components/shared/newsletter-section';
import { InfluencerApplication } from '../types/influencer.types';
import { useInfluencerApplication } from '../hooks/use-influencer-application';

const steps = [
  'Personal Information',
  'Social Media',
  'About You',
  'Review & Submit',
];

const inputClass =
  'h-10 w-full border border-neutral-300 bg-white px-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#D4AF37]';

const SOCIAL_PLATFORMS = {
  instagramUrl: {
    label: 'Instagram',
    hosts: ['instagram.com', 'www.instagram.com'],
  },
  tiktokUrl: {
    label: 'TikTok',
    hosts: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'],
  },
  youtubeUrl: {
    label: 'YouTube',
    hosts: [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'www.youtu.be',
    ],
  },
  facebookUrl: {
    label: 'Facebook',
    hosts: [
      'facebook.com',
      'www.facebook.com',
      'm.facebook.com',
      'fb.com',
      'www.fb.com',
    ],
  },
  xUrl: {
    label: 'X (Twitter)',
    hosts: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
  },
} as const;

type SocialFieldName = keyof typeof SOCIAL_PLATFORMS;

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  icon,
}: {
  label: string;
  name: keyof InfluencerApplication;
  value: string;
  onChange: (name: keyof InfluencerApplication, value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block text-[11px] font-semibold text-neutral-900">
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}

      <span className="relative mt-1.5 block">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {icon}
          </span>
        )}

        <input
          className={`${inputClass} ${icon ? 'pl-9' : ''}`}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={
            name === 'email' ? 'email' : name === 'phone' ? 'tel' : undefined
          }
        />
      </span>
    </label>
  );
}

function validatePersonalInformation(
  values: InfluencerApplication,
): string {
  const missingFields: string[] = [];

  if (!values.firstName.trim() || !values.lastName.trim()) {
    missingFields.push('Full Name (enter first and last name)');
  }

  if (!values.email.trim()) missingFields.push('Email Address');
  if (!values.phone.trim()) missingFields.push('Phone Number');
  if (!values.country.trim()) missingFields.push('Country');
  if (!values.dateOfBirth) missingFields.push('Date of Birth');
  if (!values.gender) missingFields.push('Gender');
  if (!values.city.trim()) missingFields.push('City');

  if (missingFields.length > 0) {
    return `Please complete: ${missingFields.join(', ')}.`;
  }

  if ((values.password ?? '').length < 8) {
    return 'Your password must contain at least 8 characters.';
  }

  if (!values.termsAccepted) {
    return 'Please accept the Influencer Program Terms & Conditions.';
  }

  return '';
}

function validateSocialUrl(
  field: SocialFieldName,
  value: string,
): string {
  if (!value.trim()) return '';

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return `Enter a valid ${SOCIAL_PLATFORMS[field].label} URL, including https://.`;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return 'The link must begin with https:// or http://.';
  }

  if (url.username || url.password) {
    return 'URLs containing embedded usernames or passwords are not allowed.';
  }

  const hostname = url.hostname.toLowerCase();
  const platform = SOCIAL_PLATFORMS[field];

  if (!(platform.hosts as readonly string[]).includes(hostname)) {
    const detectedPlatform = Object.entries(SOCIAL_PLATFORMS).find(
      ([, config]) =>
        (config.hosts as readonly string[]).includes(hostname),
    );

    if (detectedPlatform) {
  return `This is a ${detectedPlatform[1].label} link. Please enter it in the ${detectedPlatform[1].label} field.`;
}
    return `This is not a recognized ${platform.label} link. Please enter a link from ${platform.label}.`;
  }

  if (url.pathname === '/' || url.pathname.trim() === '') {
    return `Enter your ${platform.label} profile or channel link, not just the website homepage.`;
  }

  return '';
}

function validateSocialMedia(values: InfluencerApplication): string {
  const fields: SocialFieldName[] = [
    'instagramUrl',
    'tiktokUrl',
    'youtubeUrl',
    'facebookUrl',
    'xUrl',
  ];

  const populatedFields = fields.filter((field) =>
    Boolean(values[field]?.trim()),
  );

  if (populatedFields.length === 0) {
    return 'Add at least one social media profile link to continue.';
  }

  for (const field of populatedFields) {
    const problem = validateSocialUrl(field, values[field] ?? '');

    if (problem) return problem;
  }

  return '';
}

function validateAboutYou(values: InfluencerApplication): string {
  if (!values.bio.trim()) {
    return 'Tell us a little about yourself before continuing.';
  }

  return '';
}

export function InfluencerApplicationForm() {
  const router = useRouter();

  const {
    values,
    update,
    isAuthenticated,
    isLoading,
    isSubmitting,
    error,
    setError,
    submit,
  } = useInfluencerApplication();

  const [step, setStep] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);

  const [socialFieldErrors, setSocialFieldErrors] = useState<
    Partial<Record<SocialFieldName, string>>
  >({});

  const handleSocialUrlChange = (
    field: SocialFieldName,
    value: string,
  ) => {
    update(field, value);

    const problem = validateSocialUrl(field, value);

    setSocialFieldErrors((previous) => ({
      ...previous,
      [field]: problem,
    }));

    setError('');
  };

  const next = () => {
    console.log('[Influencer form] NEXT clicked. Current step:', step);

    let problem = '';

    if (step === 0) {
      problem = validatePersonalInformation(values);
    } else if (step === 1) {
      problem = validateSocialMedia(values);
    } else if (step === 2) {
      problem = validateAboutYou(values);
    }

    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setStep((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    console.log(
      '[Influencer form] Submit Application clicked. Current step:',
      step,
    );

    if (step !== 3 || isSubmitting || isLoading) {
      console.warn('[Influencer form] Submission blocked.', { step });
      return;
    }

    const personalError = validatePersonalInformation(values);

    if (personalError) {
      setError(personalError);
      setStep(0);
      return;
    }

    const socialError = validateSocialMedia(values);

    if (socialError) {
      setError(socialError);
      setStep(1);
      return;
    }

    const aboutError = validateAboutYou(values);

    if (aboutError) {
      setError(aboutError);
      setStep(2);
      return;
    }

    setError('');

    console.log('[Influencer form] Sending registration request.');

    const success = await submit();

    if (success) {
      console.log('[Influencer form] Registration successful.');
      router.push('/influencer/submitted');
    } else {
      console.error('[Influencer form] Registration failed.');
    }
  };

  return (
    <CustomerLayout>
      <main className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-8">
        <div className="mb-4 pt-3 text-xs text-neutral-500">
          <Link href="/">Home</Link>
          <ChevronRight className="mx-1 inline" size={12} />
          <Link href="/influencer">Become an Influencer</Link>
          <ChevronRight className="mx-1 inline" size={12} />
          Apply Now
        </div>

        <section className="mx-auto max-w-[900px] border border-neutral-200 bg-white px-5 py-7 sm:px-8 sm:py-9">
          <h1 className="text-xl font-black text-black">
            INFLUENCER APPLICATION
          </h1>

          <p className="mt-1 text-xs text-neutral-600">
            Fill in your details below to join our influencer program.
          </p>

          {isLoading && (
            <p
              role="status"
              className="mt-4 border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-600"
            >
              Loading your account details…
            </p>
          )}

          {isAuthenticated && !isLoading && (
            <p className="mt-4 border border-[#e8d9ab] bg-[#fffaf0] px-4 py-3 text-xs text-neutral-700">
              Your existing account details are filled in. You can review and
              edit them before submitting.
            </p>
          )}

          <div className="my-8 grid grid-cols-4 gap-1 sm:gap-4">
            {steps.map((title, index) => (
              <div key={title} className="relative text-center">
                <div
                  className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold"
                  style={{
                    background:
                      step === index
                        ? '#D4AF37'
                        : index < step
                          ? '#111'
                          : '#e5e5e5',
                    color: step === index || index < step ? '#fff' : '#333',
                    borderColor: index <= step ? '#D4AF37' : '#ddd',
                  }}
                >
                  {index < step ? <Check size={15} /> : index + 1}
                </div>

                {index < steps.length - 1 && (
                  <span className="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-4 h-px bg-neutral-300" />
                )}

                <p className="mt-2 text-[9px] font-semibold leading-3 text-neutral-700 sm:text-[10px]">
                  {title}
                </p>
              </div>
            ))}
          </div>

          <div>
            {step === 0 && (
              <div>
                <h2 className="mb-5 text-sm font-extrabold text-black">
                  PERSONAL INFORMATION
                </h2>

                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    name="firstName"
                    value={`${values.firstName}${values.lastName ? ` ${values.lastName}` : ''}`}
                    onChange={(_, value) => {
                      const parts = value.trimStart().split(/\s+/);
                      update('firstName', parts.shift() ?? '');
                      update('lastName', parts.join(' '));
                    }}
                    required
                    placeholder="Enter your full name"
                    icon={<UserRound size={15} />}
                  />

                  <Field
                    label="Email Address"
                    name="email"
                    value={values.email}
                    onChange={update}
                    type="email"
                    required
                    placeholder="Enter your email address"
                    icon={<Mail size={15} />}
                  />

                  <Field
                    label="Password"
                    name="password"
                    value={values.password ?? ''}
                    onChange={update}
                    type="password"
                    required
                    placeholder="At least 8 characters"
                  />

                  <Field
                    label="Phone Number"
                    name="phone"
                    value={values.phone}
                    onChange={update}
                    type="tel"
                    required
                    placeholder="Enter your phone number"
                    icon={<Phone size={15} />}
                  />

                  <Field
                    label="Country"
                    name="country"
                    value={values.country}
                    onChange={update}
                    required
                    placeholder="Enter your country"
                  />

                  <Field
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={values.dateOfBirth}
                    onChange={update}
                    type="date"
                    required
                  />

                  <label className="text-[11px] font-semibold">
                    Gender<span className="ml-1 text-red-600">*</span>
                    <select
                      className={`${inputClass} mt-1.5`}
                      value={values.gender}
                      onChange={(event) =>
                        update('gender', event.target.value)
                      }
                      required
                    >
                      <option value="">Select your gender</option>
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="NON_BINARY">Non-binary</option>
                      <option value="PREFER_NOT_TO_SAY">
                        Prefer not to say
                      </option>
                    </select>
                  </label>

                  <Field
                    label="City"
                    name="city"
                    value={values.city}
                    onChange={update}
                    required
                    placeholder="Enter your city"
                  />

                  <Field
                    label="Occupation"
                    name="occupation"
                    value={values.occupation}
                    onChange={update}
                    placeholder="What do you do?"
                  />
                </div>

                <div className="mt-5">
                  <label className="flex items-start gap-2 text-[11px] text-neutral-800">
                    <input
                      type="checkbox"
                      checked={values.termsAccepted}
                      onChange={(event) =>
                        update('termsAccepted', event.target.checked)
                      }
                      className="mt-0.5 accent-[#D4AF37]"
                    />

                    <span>
                      I have read and agree to the Influencer Program{' '}
                      <button
                        type="button"
                        onClick={() => setTermsOpen(true)}
                        className="text-blue-700 underline"
                      >
                        Terms &amp; Conditions
                      </button>
                    </span>
                  </label>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-2 text-sm font-extrabold text-black">
                  SOCIAL MEDIA
                </h2>

                <p className="mb-5 text-xs text-neutral-600">
                  Add at least one public profile where you share sports and
                  lifestyle content. Each link must belong to the platform
                  shown beside its field.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      'instagramUrl',
                      'tiktokUrl',
                      'youtubeUrl',
                      'facebookUrl',
                      'xUrl',
                    ] as const
                  ).map((key) => {
                    const platform = SOCIAL_PLATFORMS[key];

                    return (
                      <div key={key}>
                        <Field
                          label={`${platform.label} URL`}
                          name={key}
                          value={values[key] ?? ''}
                          onChange={(_, value) =>
                            handleSocialUrlChange(key, value)
                          }
                          type="url"
                          placeholder={`Paste your ${platform.label} profile URL`}
                        />

                        {socialFieldErrors[key] && (
                          <p
                            role="alert"
                            className="mt-1 text-[11px] text-red-600"
                          >
                            {socialFieldErrors[key]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-2 text-sm font-extrabold text-black">
                  ABOUT YOU
                </h2>

                <p className="mb-5 text-xs text-neutral-600">
                  Help our team understand your content and the audience you
                  connect with.
                </p>

                <label className="block text-[11px] font-semibold">
                  Tell us about yourself
                  <span className="ml-1 text-red-600">*</span>
                  <textarea
                    className="mt-1.5 min-h-32 w-full border border-neutral-300 p-3 text-xs outline-none focus:border-[#D4AF37]"
                    maxLength={2000}
                    value={values.bio}
                    onChange={(event) => update('bio', event.target.value)}
                    placeholder="Share your sports interests and the kind of content you create."
                    required
                  />
                </label>

                <label className="mt-5 block text-[11px] font-semibold">
                  Why would you like to join Maillot Store?
                  <textarea
                    className="mt-1.5 min-h-24 w-full border border-neutral-300 p-3 text-xs outline-none focus:border-[#D4AF37]"
                    maxLength={2000}
                    value={values.applicationNote}
                    onChange={(event) =>
                      update('applicationNote', event.target.value)
                    }
                    placeholder="Tell us what you hope to bring to the program."
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-5 text-sm font-extrabold text-black">
                  REVIEW &amp; SUBMIT
                </h2>

                <div className="space-y-4">
                  {(
                    [
                      [
                        'Personal Information',
                        `${values.firstName} ${values.lastName} · ${values.email} · ${values.phone}`,
                        0,
                      ],
                      [
                        'Social Media',
                        [
                          values.instagramUrl,
                          values.tiktokUrl,
                          values.youtubeUrl,
                          values.facebookUrl,
                          values.xUrl,
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'No social profile links added',
                        1,
                      ],
                      ['About You', values.bio || '—', 2],
                    ] as const
                  ).map(([title, summary, target]) => (
                    <div
                      key={title}
                      className="flex items-start justify-between gap-3 border border-neutral-200 p-4"
                    >
                      <div>
                        <h3 className="text-xs font-bold">{title}</h3>
                        <p className="mt-1 whitespace-pre-line text-xs text-neutral-600">
                          {summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setStep(target);
                        }}
                        className="text-[10px] font-bold text-[#9b740b] underline"
                      >
                        EDIT
                      </button>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-xs leading-5 text-neutral-600">
                  Your application will be submitted for review. Your
                  influencer account remains pending until the Maillot Store
                  team approves it.
                </p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
              >
                {error}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
              <Link
                href="/influencer"
                className="inline-flex h-10 items-center justify-center border border-neutral-400 px-6 text-[10px] font-bold"
              >
                CANCEL
              </Link>

              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    className="h-10 border border-neutral-400 px-6 text-[10px] font-bold"
                  >
                    BACK
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={next}
                    disabled={isLoading || isSubmitting}
                    className="h-10 bg-[#D4AF37] px-8 text-[10px] font-extrabold text-black disabled:opacity-60"
                  >
                    NEXT STEP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting || isLoading}
                    className="h-10 bg-[#D4AF37] px-8 text-[10px] font-extrabold text-black disabled:opacity-60"
                  >
                    {isSubmitting ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {termsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="influencer-terms-title"
          >
            <div className="w-full max-w-lg bg-white p-6">
              <h2 id="influencer-terms-title" className="text-lg font-black">
                Influencer Program Terms
              </h2>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-700">
                <li>
                  Applications remain pending until reviewed and approved by
                  Maillot Store.
                </li>
                <li>
                  Commission is recorded only for eligible completed purchases
                  attributed to your referral link.
                </li>
                <li>
                  The rate used for a recorded commission is retained with
                  that commission; later rate changes apply to future completed
                  sales.
                </li>
                <li>
                  Withdrawal requests are subject to approval and the store&apos;s
                  configured withdrawal policy.
                </li>
              </ul>

              <button
                type="button"
                onClick={() => setTermsOpen(false)}
                className="mt-6 h-10 bg-[#D4AF37] px-7 text-xs font-bold"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </main>

      <NewsletterSection flush />
    </CustomerLayout>
  );
}
