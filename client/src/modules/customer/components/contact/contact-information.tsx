
import {
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const contactDetails = [
  {
    title: "Address",
    Icon: MapPin,
    content: (
      <>
        Quarter 12, Molyko, Buea
        <br />
        Cameroon
      </>
    ),
  },
  {
    title: "Phone",
    Icon: Phone,
    content: "+237 670 12 34 56",
  },
  {
    title: "Email",
    Icon: Mail,
    content: "support@maillotstore.cm",
  },
  {
    title: "Working Hours",
    Icon: Clock3,
    content: (
      <>
        Mon – Sat: 8:00 AM – 7:00 PM
        <br />
        Sunday: 10:00 AM – 4:00 PM
      </>
    ),
  },
];

export function ContactInformation() {
  return (
    <section aria-labelledby="contact-information-title">
      <h2
        id="contact-information-title"
        className="text-sm font-extrabold uppercase tracking-wide"
      >
        CONTACT INFORMATION
      </h2>

      <p className="mt-2 text-xs leading-5 text-neutral-600">
        Reach out to us using any of the details below.
      </p>

      <div className="mt-6 space-y-5">
        {contactDetails.map(({ title, Icon, content }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon
              size={17}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-neutral-900"
            />

            <div className="min-w-0">
              <h3 className="text-xs font-bold">{title}</h3>
              <div className="mt-1 text-xs leading-5 text-neutral-600">
                {content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
