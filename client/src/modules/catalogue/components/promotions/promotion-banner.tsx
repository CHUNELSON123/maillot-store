import Link from "next/link";

import type { Promotion } from "@/modules/cms/types/cms.types";

type PromotionBannerProps = {
  promotion: Promotion;
};

function formatDiscount(promotion: Promotion): string | null {
  if (!Number.isFinite(promotion.discountValue) || promotion.discountValue <= 0) {
    return null;
  }

  switch (promotion.discountType.trim().toLowerCase()) {
    case "percentage":
    case "percent":
      return `${promotion.discountValue}% OFF`;
    default:
      return `${promotion.discountValue.toLocaleString()} XAF OFF`;
  }
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString();
}

function resolveImageUrl(imageUrl: string) {
  if (!imageUrl.startsWith('/uploads')) return imageUrl;
  try { return `${new URL(process.env.NEXT_PUBLIC_API_URL ?? '').origin}${imageUrl}`; }
  catch { return imageUrl; }
}

export function PromotionBanner({ promotion }: PromotionBannerProps) {
  const discount = formatDiscount(promotion);

  const targetLabel = promotion.targetType === 'ALL' ? 'ON SELECTED PRODUCTS' : promotion.targetType === 'BRAND' ? 'ON SELECTED BRANDS' : promotion.targetType === 'CATEGORY' ? 'ON SELECTED CATEGORIES' : 'ON SELECTED PRODUCTS';
  return (
    <article className="relative min-h-[180px] overflow-hidden rounded-[4px] bg-[#090909] p-5 text-white sm:p-7">
      {promotion.imageUrl && <img src={resolveImageUrl(promotion.imageUrl)} alt="" className="absolute inset-0 h-full w-full object-cover"/>}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"/>
      <div className="absolute inset-y-0 right-0 w-1 bg-[#D4AF37]" />
      <div className="relative z-10">
      <p className="text-[8px] font-bold uppercase tracking-wide text-[#D4AF37] sm:text-[10px]">
        ACTIVE PROMOTION
      </p>
      <h2 className="mt-2 text-xl font-black uppercase sm:text-2xl">
        {promotion.title}
      </h2>
      {discount && (
        <p className="mt-2 text-2xl font-black text-[#D4AF37] sm:text-3xl">
          {discount}
        </p>
      )}
      {promotion.description && (
        <p className="mt-2 max-w-prose text-sm text-white/80">
          {promotion.description}
        </p>
      )}
      <p className="mt-4 text-xs text-white/60">
        {targetLabel} · Valid {formatDate(promotion.startDate)} – {formatDate(promotion.endDate)}
      </p>
      <Link
        href="/shop"
        className="mt-5 inline-flex h-8 items-center bg-white px-4 text-[8px] font-extrabold uppercase text-black transition hover:bg-[#D4AF37]"
      >
        SHOP NOW
      </Link>
      </div>
    </article>
  );
}
