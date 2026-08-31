"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Banner,
  Promotion,
} from "@/modules/cms/types/cms.types";

type HomePromotionProps = {
  promotion?: Promotion;
  banner?: Banner;
};

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

export function HomePromotion({
  promotion,
  banner,
}: HomePromotionProps) {
  const imageUrl = resolveImageUrl(banner?.imageUrl);

  const discountText =
    promotion &&
    promotion.discountType.toLowerCase() === "percentage"
      ? `UP TO ${promotion.discountValue}% OFF`
      : "UP TO 20% OFF";

  const promotionTitle =
    promotion?.title || "ON SELECTED JERSEYS";

  const description =
    promotion?.description ||
    "Don't miss out on our special discounts. Offer valid for a limited time only!";

  const link =
    banner?.linkUrl || "/shop";

  return (
    <section className="bg-[#090909] px-3 py-2 min-[380px]:px-4 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative min-h-[190px] overflow-hidden rounded-[3px] border border-[#8B6900] bg-black sm:min-h-[155px] lg:min-h-[130px]">
          <Image
            src={imageUrl}
            alt={banner?.title || "Promotion"}
            fill
            sizes="1200px"
            className="object-cover object-[70%_48%]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.82)),linear-gradient(90deg,#000_0%,rgba(0,0,0,0.94)_45%,rgba(0,0,0,0.18)_100%)]" />

          <div className="absolute -left-[70px] top-[-130px] h-[300px] w-[230px] rotate-[42deg] border-r-2 border-[#D4AF37]" />

          <div className="absolute left-[60%] top-[-110px] hidden h-[320px] w-[2px] rotate-[42deg] bg-[#D4AF37] sm:block lg:left-[39%]" />

          <div className="relative z-10 flex min-h-[190px] items-start px-4 py-5 min-[380px]:px-5 sm:min-h-[155px] sm:items-center sm:px-9 sm:py-4 lg:min-h-[130px] lg:px-12">
            <div className="w-full max-w-[340px] sm:w-[48%] lg:w-[43%]">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37] sm:text-[9px]">
                LIMITED-TIME OFFER
              </p>

              <h2 className="mt-1 text-[24px] font-black uppercase leading-[0.9] tracking-normal text-white min-[380px]:text-[27px] sm:text-[31px]">
                {discountText}
              </h2>

              <h3 className="mt-1 text-[12px] font-black uppercase leading-none text-[#D4AF37] sm:text-[14px]">
                {promotionTitle}
              </h3>

              <p className="mt-1 max-w-[300px] text-[8px] leading-[1.45] text-white/80 sm:text-[9px]">
                {description}
              </p>

              <Link
                href={link}
                className="mt-3 inline-flex h-[25px] min-w-[128px] items-center justify-center bg-[#D4AF37] px-4 text-[8px] font-black uppercase text-black transition hover:bg-[#e2bf4c] sm:px-5"
              >
                SHOP PROMOTION
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#D4AF37]" />
        </div>
      </div>
    </section>
  );
}
