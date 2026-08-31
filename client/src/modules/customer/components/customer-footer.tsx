import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    name: "TikTok",
    label: "♪",
  },
  {
    name: "Facebook",
    label: "f",
  },
  {
    name: "Snapchat",
    label: "👻",
  },
  {
    name: "X",
    label: "𝕏",
  },
];

export function CustomerFooter() {
  return (
    <footer className="border-t border-neutral-900 bg-[#050505] text-white">
      <div className="mx-auto max-w-[1200px] px-5 pt-3 sm:px-8 lg:px-4">
        {/* MAIN FOOTER */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-7 py-3 sm:grid-cols-3 lg:grid-cols-[1.45fr_0.8fr_0.8fr_0.8fr_0.85fr_1.15fr] lg:gap-x-7">
          {/* BRAND */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              aria-label="Maillot Store"
              className="relative block h-[55px] w-[105px]"
            >
              <Image
                src="/maillotstore-logo.jpg"
                alt="Maillot Store"
                fill
                sizes="105px"
                className="object-contain mix-blend-screen"
              />
            </Link>

            <p className="mt-1 max-w-[175px] text-[9px] leading-3 text-neutral-500">
              Your number one destination
              <br />
              for sports jerseys and
              <br />
              merchandise.
            </p>

            {/* Social icons */}
            <div className="mt-2 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="flex h-5 w-5 items-center justify-center text-[10px] font-bold text-neutral-300 transition hover:text-[#D4AF37]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* SHOP */}
          <div>
            <h3 className="text-[9px] font-extrabold uppercase tracking-wide text-[#D4AF37]">
              SHOP
            </h3>

            <div className="mt-2 space-y-1 text-[9px] text-neutral-400">
              <Link
                href="/shop"
                className="block transition hover:text-white"
              >
                Shop
              </Link>

              <Link
                href="/shop"
                className="block transition hover:text-white"
              >
                Categories
              </Link>

              <Link
                href="/shop"
                className="block transition hover:text-white"
              >
                Promotions
              </Link>

              <Link
                href="/shop"
                className="block transition hover:text-white"
              >
                New Arrivals
              </Link>
            </div>
          </div>

          {/* CUSTOMER */}
          <div>
            <h3 className="text-[9px] font-extrabold uppercase tracking-wide text-[#D4AF37]">
              CUSTOMER
            </h3>

            <div className="mt-2 space-y-1 text-[9px] text-neutral-400">
              <Link
                href="/account"
                className="block transition hover:text-white"
              >
                My Account
              </Link>

              <Link
                href="/account/orders"
                className="block transition hover:text-white"
              >
                Orders
              </Link>

              <Link
                href="/account/track-order"
                className="block transition hover:text-white"
              >
                Track Order
              </Link>

              <Link
                href="/account"
                className="block transition hover:text-white"
              >
                Wishlist
              </Link>

              <Link
                href="/account"
                className="block transition hover:text-white"
              >
                Returns & Exchanges
              </Link>
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-[9px] font-extrabold uppercase tracking-wide text-[#D4AF37]">
              COMPANY
            </h3>

            <div className="mt-2 space-y-1 text-[9px] text-neutral-400">
              <Link
                href="/about"
                className="block transition hover:text-white"
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className="block transition hover:text-white"
              >
                Contact
              </Link>

              <Link
                href="/influencer"
                className="block transition hover:text-white"
              >
                Become an Influencer
              </Link>

              <Link
                href="/faqs"
                className="block transition hover:text-white"
              >
                FAQs
              </Link>
            </div>
          </div>

          {/* CONNECT */}
          <div>
            <h3 className="text-[9px] font-extrabold uppercase tracking-wide text-[#D4AF37]">
              CONNECT
            </h3>

            <div className="mt-2 space-y-1 text-[9px] text-neutral-400">
              <a
                href="#"
                className="block transition hover:text-white"
              >
                TikTok
              </a>

              <a
                href="#"
                className="block transition hover:text-white"
              >
                Facebook
              </a>

              <a
                href="#"
                className="block transition hover:text-white"
              >
                Snapchat
              </a>

              <a
                href="#"
                className="block transition hover:text-white"
              >
                X
              </a>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div>
            <h3 className="text-[9px] font-extrabold uppercase tracking-wide text-[#D4AF37]">
              PAYMENT METHODS
            </h3>

            <div className="mt-3 flex items-start gap-2">
              {/* MTN */}
              <div className="flex flex-col items-center">
                <div className="flex h-[22px] w-[38px] items-center justify-center rounded-[3px] bg-[#ffcc00]">
                  <span className="text-[8px] font-black text-black">
                    MTN
                  </span>
                </div>

                <span className="mt-1 text-[7px] text-neutral-500">
                  Mobile Money
                </span>
              </div>

              {/* Orange */}
              <div className="flex flex-col items-center">
                <div className="flex h-[22px] w-[38px] items-center justify-center rounded-[3px] bg-white">
                  <span className="text-[8px] font-black text-[#f28c00]">
                    ORANGE
                  </span>
                </div>

                <span className="mt-1 text-[7px] text-neutral-500">
                  Money
                </span>
              </div>

              {/* VISA */}
              <div className="flex flex-col items-center">
                <div className="flex h-[22px] w-[38px] items-center justify-center rounded-[3px] bg-white">
                  <span className="text-[9px] font-black italic text-[#1434CB]">
                    VISA
                  </span>
                </div>

                <span className="mt-1 text-[7px] text-neutral-500">
                  Bank Card
                </span>
              </div>

              {/* CASH */}
              <div className="flex flex-col items-center">
                <div className="flex h-[22px] w-[38px] items-center justify-center rounded-[3px] border border-neutral-600 bg-white">
                  <span className="text-[7px] font-black text-green-700">
                    CASH
                  </span>
                </div>

                <span className="mt-1 text-[7px] text-neutral-500">
                  Cash Before
                  <br />
                  Delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col gap-2 border-t border-neutral-800 py-2 text-[8px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2024 Maillot Store. All Rights Reserved.
          </p>

          <div className="flex items-center gap-2">
            <Link
              href="/privacy-policy"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>

            <span>|</span>

            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}