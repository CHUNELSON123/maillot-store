
"use client";

import {
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useCms } from "@/modules/cms/hooks/use-cms";
import { pageContentValue } from "@/modules/cms/utils/page-content-defaults";

export function ContactInformation() {
  const { content } = useCms();
  const contactDetails = [
    { title: "Address", Icon: MapPin, content: pageContentValue(content, 'cms.contact.address') },
    { title: "Phone", Icon: Phone, content: pageContentValue(content, 'cms.contact.phone') },
    { title: "Email", Icon: Mail, content: pageContentValue(content, 'cms.contact.email') },
    { title: "Working Hours", Icon: Clock3, content: pageContentValue(content, 'cms.contact.hours') },
  ];
  return (
    <section aria-labelledby="contact-information-title">
      <h2
        id="contact-information-title"
        className="text-sm font-extrabold uppercase tracking-wide"
      >
        {pageContentValue(content, 'cms.contact.information_title')}
      </h2>

      <p className="mt-2 text-xs leading-5 text-neutral-600">
        {pageContentValue(content, 'cms.contact.information_intro')}
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
              <div className="mt-1 whitespace-pre-line text-xs leading-5 text-neutral-600">
                {content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
