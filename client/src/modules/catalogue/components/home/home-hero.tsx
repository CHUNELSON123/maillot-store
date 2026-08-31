"use client";

import Image from "next/image";
import Link from "next/link";

import type { Banner } from "@/modules/cms/types/cms.types";

interface HomeHeroProps {
  banner?: Banner;
}

function resolveImageUrl(imageUrl?: string) {
  if (!imageUrl) {
    return "/login_banner.png";
  }

  if (imageUrl.startsWith("http") || !imageUrl.startsWith("/uploads")) {
    return imageUrl;
  }

  try {
    const apiOrigin = new URL(
      process.env.NEXT_PUBLIC_API_URL ?? "",
    ).origin;

    return `${apiOrigin}${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

export function HomeHero({ banner }: HomeHeroProps) {
  const imageUrl = resolveImageUrl(banner?.imageUrl);

  return (
    <section className="relative min-h-[430px] overflow-hidden border-b border-[#6f5500] bg-[#050505] text-white sm:min-h-[400px] lg:min-h-[300px]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#050505_0%,#111_42%,#020202_100%)]" />

      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.28),transparent_24%),radial-gradient(circle_at_88%_0%,rgba(255,255,255,0.24),transparent_24%)] opacity-70" />

      <div className="absolute bottom-0 right-0 top-[170px] w-full opacity-60 sm:top-[120px] lg:left-[45%] lg:top-0 lg:w-[55%] lg:opacity-95">
        <Image
          src={imageUrl}
          alt={banner?.title || "Maillot Store sports merchandise"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center lg:object-[center_58%]"
        />
      </div>

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.72)),linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.95)_34%,rgba(5,5,5,0.35)_70%,rgba(5,5,5,0.8)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-16 -left-28 h-[160px] w-[420px] -rotate-[32deg] border-t-4 border-[#D4AF37]/80" />

        <div className="absolute -bottom-16 -right-28 h-[160px] w-[420px] rotate-[32deg] border-t-4 border-[#D4AF37]/80" />

        <div className="absolute bottom-0 left-0 h-24 w-full bg-[radial-gradient(circle_at_52%_100%,rgba(212,175,55,0.18),transparent_54%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[430px] max-w-[1200px] items-start px-3 pb-40 pt-8 min-[380px]:px-4 sm:min-h-[400px] sm:px-8 sm:pb-32 sm:pt-10 lg:min-h-[300px] lg:items-center lg:px-10 lg:py-0">
        <div className="max-w-[540px]">
          <h1 className="text-[33px] font-black uppercase leading-[0.92] tracking-normal min-[380px]:text-[36px] sm:text-[44px] lg:text-[50px]">
            SPORTS
            <br />
            MERCHANDISE
          </h1>

          <h2 className="mt-2 text-[19px] font-black uppercase leading-none tracking-normal text-[#D4AF37] min-[380px]:text-[21px] sm:text-[26px] lg:text-[29px]">
            WEAR YOUR PASSION.
          </h2>

          <p className="mt-3 max-w-[350px] text-[12px] leading-5 text-neutral-200 sm:text-[13px]">
            Football, basketball jerseys and
            <br />
            sports merchandise for fans.
          </p>

          <div className="mt-4 flex max-w-[335px] flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center sm:max-w-none">
            <Link
              href="/shop"
              className="inline-flex h-[34px] min-w-[132px] items-center justify-center bg-[#D4AF37] px-5 text-[10px] font-extrabold uppercase tracking-wide text-black transition hover:bg-[#e2bf4c]"
            >
              SHOP NOW
            </Link>

            <Link
              href="/shop"
              className="inline-flex h-[34px] min-w-[182px] items-center justify-center border border-[#D4AF37] bg-black/30 px-5 text-[10px] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#D4AF37] hover:text-black"
            >
              EXPLORE COLLECTION
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#D4AF37]" />
    </section>
  );
}
