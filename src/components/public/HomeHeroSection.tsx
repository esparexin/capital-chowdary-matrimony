import Image from "next/image";
import Link from "next/link";
import type { HeroContentData } from "@/features/homepage/hero-content";

interface HomeHeroSectionProps {
  content: HeroContentData;
}

/**
 * Compact editorial hero section for Capital Chowdary Matrimony.
 * Mobile uses a compact side-by-side header + wedding photo at 360px+ (with a stacked
 * fallback at 320px), followed by CTAs, highlights, and association info; desktop renders
 * the two-column left text + right photograph layout.
 */
export function HomeHeroSection({ content }: HomeHeroSectionProps) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="rounded-2xl border border-[#C5A15A]/35 bg-[#FAF8F3] p-3.5 shadow-xs min-[360px]:p-4 sm:p-7 lg:px-9 lg:py-8"
    >
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-12 min-[360px]:items-start min-[360px]:gap-3.5 lg:gap-x-8 lg:gap-y-3.5">
        <div className="space-y-2 min-[360px]:col-span-7 sm:space-y-3.5 lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <h1
            id="home-hero-heading"
            className="font-serif text-[1.25rem] font-semibold leading-tight tracking-tight text-[#70243B] min-[390px]:text-[1.375rem] sm:text-3xl lg:text-[2.125rem]"
          >
            {content.title}
          </h1>

          <p
            lang="te"
            className="mixed-script-text border-l-2 border-[#C5A15A] pl-2.5 text-[0.8125rem] font-medium leading-snug text-[#70243B] min-[390px]:text-sm sm:pl-3.5 sm:text-[1.0625rem] sm:leading-relaxed"
          >
            {content.teluguIntro}
          </p>
        </div>

        <div className="min-[360px]:col-span-5 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-[#C5A15A]/45 bg-[#F3ECE0] min-[360px]:aspect-[4/5] min-[410px]:aspect-square md:aspect-[4/3]">
            <Image
              src={content.image.src}
              alt={content.image.alt}
              width={content.image.width}
              height={content.image.height}
              priority
              fetchPriority="high"
              sizes="(max-width: 359px) 100vw, (max-width: 1023px) 40vw, 460px"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>

        <div className="space-y-2.5 min-[360px]:col-span-12 sm:space-y-3.5 lg:col-span-7 lg:col-start-1 lg:row-start-2">
          <p className="text-[0.8125rem] leading-relaxed text-[#3D272E] sm:text-[15px]">
            {content.description}
          </p>

          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3 md:pt-1">
            <Link
              href={content.primaryCtaHref}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#70243B] px-5 py-2 text-center text-sm font-semibold text-[#FAF8F3] shadow-xs transition-colors hover:bg-[#5B1C2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
            >
              {content.primaryCtaLabel}
            </Link>
            <Link
              href={content.secondaryCtaHref}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#C5A15A] bg-white px-5 py-2 text-center text-sm font-semibold text-[#70243B] shadow-xs transition-colors hover:bg-[#F3ECE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
            >
              {content.secondaryCtaLabel}
            </Link>
          </div>

          <div className="pt-0.5 sm:pt-1">
            {content.highlights
              .filter((item) => !item.title.toLowerCase().includes("marriage events"))
              .map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#C5A15A]/35 border-l-2 border-l-[#C5A15A] bg-white/90 px-3 py-2 sm:px-3.5 sm:py-2.5"
                >
                  <p className="text-xs font-semibold leading-snug text-[#70243B] sm:text-sm">
                    {item.title}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 hidden text-[0.6875rem] leading-snug text-[#593E46] md:block sm:text-xs">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
