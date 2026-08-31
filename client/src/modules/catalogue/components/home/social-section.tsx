"use client";

import Link from "next/link";
import { Music2 } from "lucide-react";

const socialLinks = [
  {
    name: "TikTok",
    href: "#",
    type: "icon",
  },
  {
    name: "Facebook",
    href: "#",
    label: "f",
  },
  {
    name: "Snapchat",
    href: "#",
    label: "👻",
  },
  {
    name: "X",
    href: "#",
    label: "𝕏",
  },
];

export function SocialSection() {
  return (
    <section className="relative min-w-0 overflow-hidden border border-[#D4AF37]/70 bg-[#080808]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/social-bg.jpg')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Content */}
      <div className="relative flex min-h-[175px] flex-col items-center justify-center px-5 py-5 text-center sm:min-h-[185px] lg:min-h-[190px]">
        <h2 className="text-[15px] font-black uppercase tracking-[0.1em] text-[#D4AF37] sm:text-[17px]">
          FOLLOW MAILLOT STORE
        </h2>

        <p className="mt-1.5 max-w-[300px] text-[9px] leading-4 text-white sm:text-[10px]">
          Stay connected with the latest products,
          <br />
          promotions and sports content.
        </p>

        {/* Social icons */}
        <div className="mt-4 flex items-center justify-center gap-6">
          {socialLinks.map((social) => (
            <Link
              key={social.name}
              href={social.href}
              aria-label={social.name}
              className="flex h-7 w-7 items-center justify-center text-white transition hover:scale-110 hover:text-[#D4AF37]"
            >
              {social.type === "icon" ? (
                <Music2
                  size={18}
                  strokeWidth={2}
                />
              ) : (
                <span className="text-[14px] font-bold">
                  {social.label}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="#"
          className="mt-3 inline-flex h-7 items-center justify-center border border-[#D4AF37] px-6 text-[7px] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#D4AF37] hover:text-black sm:h-8 sm:px-7 sm:text-[8px]"
        >
          FOLLOW US
        </Link>
      </div>
    </section>
  );
}