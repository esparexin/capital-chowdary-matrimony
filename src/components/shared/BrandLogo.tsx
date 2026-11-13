import Image from "next/image";
import { SITE_CONFIG } from "@/config/site-config";
import { cn } from "@/lib/utils/cn";

interface BrandLogoProps {
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
}

/**
 * Renders the official Capital Chowdary Matrimony logo (`828x629`)
 * on a high-contrast surface so all three lines remain legible.
 */
export function BrandLogo({ className, wrapperClassName, priority = false }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-2 py-1 shadow-xs",
        wrapperClassName,
      )}
    >
      <Image
        src={SITE_CONFIG.logoPath}
        alt={SITE_CONFIG.brandName}
        width={828}
        height={629}
        priority={priority}
        className={cn("h-10 w-auto object-contain", className)}
      />
    </span>
  );
}
