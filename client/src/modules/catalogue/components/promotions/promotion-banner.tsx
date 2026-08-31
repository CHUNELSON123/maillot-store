import Image from "next/image";
import Link from "next/link";

type PromotionBannerProps = {
  variant: "main" | "training" | "footwear";
};

const bannerContent = {
  main: {
    label: "SPECIAL OFFER",
    title: "UP TO",
    discount: "30%",
    subtitle: "OFF",
    description: "ON SELECTED JERSEYS",
    image: "/promotions/selected-jerseys.png",
  },

  training: {
    label: "TRAINING WEAR",
    title: "20% OFF",
    description: "Limited Time Only!",
    image: "/promotions/training-wear.png",
  },

  footwear: {
    label: "FOOTWEAR SALE",
    title: "UP TO 25% OFF",
    description: "On Selected Boots",
    image: "/promotions/football-boots.png",
  },
};

export function PromotionBanner({
  variant,
}: PromotionBannerProps) {
  if (variant === "main") {
    const content = bannerContent.main;

    return (
      <Link
        href="/shop"
        className="group relative block min-h-[175px] overflow-hidden rounded-[4px] bg-[#090909] text-white transition hover:border-[#D4AF37] sm:min-h-[210px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#101010] to-[#171717]" />

        <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-5">
          <p className="text-[8px] font-bold uppercase tracking-wide text-white sm:text-[10px]">
            {content.label}
          </p>

          <p className="mt-2 text-[11px] font-extrabold uppercase text-white sm:text-[14px]">
            {content.title}
          </p>

          <p className="text-[34px] font-black leading-[0.85] text-[#D4AF37] sm:text-[48px]">
            {content.discount}
          </p>

          <p className="mt-1 text-[13px] font-extrabold uppercase text-[#D4AF37] sm:text-[17px]">
            {content.subtitle}
          </p>

          <p className="mt-2 text-[7px] font-bold uppercase text-white sm:text-[9px]">
            {content.description}
          </p>

          <span className="mt-4 inline-flex h-7 items-center bg-white px-3 text-[7px] font-extrabold uppercase text-black sm:h-8 sm:px-4 sm:text-[8px]">
            SHOP NOW
          </span>
        </div>

        <div className="absolute right-0 top-0 h-full w-[62%]">
          <Image
            src={content.image}
            alt="Selected jerseys promotion"
            fill
            sizes="(max-width: 640px) 62vw, 500px"
            className="object-contain object-right transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
    );
  }

  const content = bannerContent[variant];

  return (
    <Link
      href="/shop"
      className="group relative block min-h-[82px] overflow-hidden rounded-[4px] bg-[#090909] text-white transition hover:border-[#D4AF37] sm:min-h-[101px]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#111111] to-[#202020]" />

      <div className="relative z-10 flex h-full flex-col justify-center px-3 sm:px-4">
        <p className="text-[8px] font-extrabold uppercase text-white sm:text-[10px]">
          {content.label}
        </p>

        <p className="mt-1 text-[19px] font-black leading-none text-[#D4AF37] sm:text-[24px]">
          {content.title}
        </p>

        <p className="mt-1 text-[6px] text-white/80 sm:text-[7px]">
          {content.description}
        </p>

        <span className="mt-2 flex h-5 w-fit items-center bg-white px-2.5 text-[6px] font-extrabold uppercase text-black sm:h-6 sm:px-3 sm:text-[7px]">
          SHOP NOW
        </span>
      </div>

      <div className="absolute right-0 top-0 h-full w-[48%]">
        <Image
          src={content.image}
          alt={content.label}
          fill
          sizes="(max-width: 640px) 48vw, 250px"
          className="object-contain object-right transition duration-500 group-hover:scale-105"
        />
      </div>
    </Link>
  );
}