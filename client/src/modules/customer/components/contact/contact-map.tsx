
"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useCms } from "@/modules/cms/hooks/use-cms";
import { pageContentValue } from "@/modules/cms/utils/page-content-defaults";

export function ContactMap() {
  const { content } = useCms();
  const address = pageContentValue(content, 'cms.contact.address');
  const mapSearchUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);
  const mapEmbedUrl = 'https://maps.google.com/maps?q=' + encodeURIComponent(address) + '&output=embed';
  return (
    <section
      aria-label="Maillot Store location"
      className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 md:min-h-[430px]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin size={17} className="shrink-0 text-[#b18b19]" />

          <div>
            <h2 className="text-xs font-bold">{pageContentValue(content, 'cms.contact.map_title')}</h2>
            <p className="mt-0.5 text-[10px] text-neutral-500">
              {address}
            </p>
          </div>
        </div>

        <a
          href={mapSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Maillot Store location in Google Maps"
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-neutral-700 transition hover:text-[#b18b19]"
        >
          Directions
          <ExternalLink size={12} />
        </a>
      </div>

      <iframe
        title={`Map showing ${address}`}
        src={mapEmbedUrl}
        className="min-h-[280px] w-full flex-1 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </section>
  );
}
