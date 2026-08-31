export function NewsletterSection() {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl bg-black px-6 py-7 text-white sm:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide">
            STAY IN THE LOOP
          </p>

          <p className="mt-1 max-w-md text-sm leading-6 text-neutral-300">
            Get updates about new jerseys,
            promotions and special offers from
            Maillot Store.
          </p>
        </div>

        <form className="flex w-full max-w-xl">
          <input
            type="email"
            placeholder="Enter your email address"
            className="h-12 min-w-0 flex-1 rounded-l-md border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#D4AF37]"
          />

          <button
            type="submit"
            className="h-12 rounded-r-md bg-[#D4AF37] px-6 text-sm font-semibold text-white transition hover:bg-[#bf9828]"
          >
            SUBSCRIBE
          </button>
        </form>
      </div>
    </section>
  );
}