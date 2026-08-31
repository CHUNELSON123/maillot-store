import Link from "next/link";

export function ShopHero() {
  return (
    <section className="relative overflow-hidden bg-[#080808] px-5 py-14 text-center text-white sm:py-16">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-20 top-0 h-40 w-72 -rotate-45 border-t border-[#D4AF37]" />
        <div className="absolute right-[-80px] top-8 h-40 w-80 rotate-[-20deg] border-t border-[#D4AF37]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          SHOP
        </h1>

        <p className="mx-auto mt-3 max-w-md text-base leading-6 text-neutral-200">
          Explore our sports merchandise
          <br />
          and find your next jersey.
        </p>

        <div className="mt-5 flex items-center justify-center gap-3 text-sm">
          <Link href="/" className="hover:text-[#D4AF37]">
            Home
          </Link>

          <span>/</span>

          <span className="text-[#D4AF37]">
            Shop
          </span>
        </div>
      </div>
    </section>
  );
}