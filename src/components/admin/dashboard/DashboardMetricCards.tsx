import Link from "next/link";
import {
  Calendar,
  CreditCard,
  FileText,
  HeartHandshake,
  History,
  Image as ImageIcon,
} from "lucide-react";

export interface DashboardStats {
  servicesTotal: number;
  servicesPublished: number;
  pricingTotal: number;
  pricingActive: number;
  eventsTotal: number;
  eventsPublished: number;
  galleryTotal: number;
  galleryPublished: number;
  pagesTotal: number;
  pagesPublished: number;
  mediaAssetsTotal: number;
  revisionsCount: number;
}

interface DashboardMetricCardsProps {
  stats: DashboardStats;
}

export function DashboardMetricCards({ stats }: DashboardMetricCardsProps) {
  const metricCards = [
    {
      title: "Services Catalog",
      value: `${stats.servicesPublished} / ${stats.servicesTotal}`,
      subtext: "Published services on site",
      icon: HeartHandshake,
      href: "/admin/services",
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      title: "Pricing Plans",
      value: `${stats.pricingActive} / ${stats.pricingTotal}`,
      subtext: "Active membership tiers",
      icon: CreditCard,
      href: "/admin/pricing",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Marriage Events",
      value: `${stats.eventsPublished} / ${stats.eventsTotal}`,
      subtext: "Published community meets",
      icon: Calendar,
      href: "/admin/events",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Verified Gallery",
      value: `${stats.galleryPublished} / ${stats.galleryTotal}`,
      subtext: "Cloudinary hosted photos",
      icon: ImageIcon,
      href: "/admin/gallery",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Pages & Legal",
      value: `${stats.pagesPublished} / ${stats.pagesTotal}`,
      subtext: "Informational & policy pages",
      icon: FileText,
      href: "/admin/pages",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: "Audit Trail",
      value: `${stats.revisionsCount}`,
      subtext: "Recent tracked revisions",
      icon: History,
      href: "#recent-revisions",
      color: "text-slate-600 bg-slate-50 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex rounded-lg border p-2 ${card.color}`}>
                <Icon className="size-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{card.subtext}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
