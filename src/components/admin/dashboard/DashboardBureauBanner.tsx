import Link from "next/link";
import { Globe, Image as ImageIcon, ShieldCheck } from "lucide-react";

export interface BureauProfileData {
  businessNameEn: string;
  businessNameTe: string;
  phoneNumber: string;
  whatsappNumber: string;
  isContactVerified: boolean;
}

interface DashboardBureauBannerProps {
  bureauProfile: BureauProfileData | null;
  mediaAssetsTotal: number;
}

export function DashboardBureauBanner({
  bureauProfile,
  mediaAssetsTotal,
}: DashboardBureauBannerProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 via-secondary/10 to-primary/5 p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold text-foreground">
              {bureauProfile?.businessNameTe || "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ"}
            </span>
            <span className="text-sm text-muted-foreground">
              ({bureauProfile?.businessNameEn || "Capital Chowdary Matrimony"})
            </span>
            {bureauProfile?.isContactVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Verified Bureau
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Official Helpline:{" "}
            <span className="font-medium text-foreground">
              {bureauProfile?.phoneNumber || "+91 99999 99999"}
            </span>{" "}
            | WhatsApp:{" "}
            <span className="font-medium text-foreground">
              {bureauProfile?.whatsappNumber || "+91 99999 99999"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 font-medium text-foreground shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Cloudflare D1: Connected
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 font-medium text-foreground shadow-2xs">
            <ImageIcon className="size-3.5 text-primary" />
            {mediaAssetsTotal} Cloudinary Assets
          </span>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Globe className="size-3.5" />
            Live Website
          </Link>
        </div>
      </div>
    </div>
  );
}
