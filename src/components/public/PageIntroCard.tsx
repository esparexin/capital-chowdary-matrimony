interface PageIntroCardProps {
  eyebrowTe?: string;
  titleEn: string;
  titleTe: string;
  summaryEn?: string;
  summaryTe?: string;
}

/**
 * Consistent burgundy/gold/ivory page intro card shared across public informational routes.
 */
export function PageIntroCard({
  eyebrowTe,
  titleEn,
  titleTe,
  summaryEn,
  summaryTe,
}: PageIntroCardProps) {
  return (
    <section className="rounded-2xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5 shadow-xs sm:p-7">
      {eyebrowTe ? (
        <p lang="te" className="mixed-script-text mb-1.5 text-sm font-semibold text-[#70243B]">
          {eyebrowTe}
        </p>
      ) : null}
      <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#70243B] sm:text-3xl">
        {titleEn}
      </h1>
      <p lang="te" className="mixed-script-text mt-1 text-base font-medium text-[#593E46]">
        {titleTe}
      </p>
      {summaryEn ? (
        <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[#3D272E] sm:text-[15px]">
          {summaryEn}
        </p>
      ) : null}
      {summaryTe ? (
        <p
          lang="te"
          className="mixed-script-text mt-1.5 max-w-3xl text-sm leading-relaxed text-[#593E46]"
        >
          {summaryTe}
        </p>
      ) : null}
    </section>
  );
}
