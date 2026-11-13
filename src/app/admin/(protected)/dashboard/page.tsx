import Link from "next/link";
import { desc } from "drizzle-orm";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  HeartHandshake,
  History,
  Image as ImageIcon,
  Layers,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getDatabase } from "@/db";
import {
  contentRevisions,
  galleryItems,
  marriageEvents,
  mediaAssets,
  pages,
  pricingPlans,
  services,
  siteSettings,
} from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats = {
    servicesTotal: 0,
    servicesPublished: 0,
    pricingTotal: 0,
    pricingActive: 0,
    eventsTotal: 0,
    eventsPublished: 0,
    galleryTotal: 0,
    galleryPublished: 0,
    pagesTotal: 0,
    pagesPublished: 0,
    mediaAssetsTotal: 0,
    revisionsCount: 0,
  };

  let recentRevisions: Array<{
    id: string;
    entityType: string;
    action: string;
    createdAt: string;
    changedByAdminId: string | null;
  }> = [];

  let bureauProfile: {
    businessNameEn: string;
    businessNameTe: string;
    phoneNumber: string;
    whatsappNumber: string;
    isContactVerified: boolean;
  } | null = null;

  try {
    const db = await getDatabase();
    const [
      allPages,
      allServices,
      allPricing,
      allEvents,
      allGallery,
      allMedia,
      revisions,
      [settingsRow],
    ] = await Promise.all([
      db.select().from(pages),
      db.select().from(services),
      db.select().from(pricingPlans),
      db.select().from(marriageEvents),
      db.select().from(galleryItems),
      db.select().from(mediaAssets),
      db.select().from(contentRevisions).orderBy(desc(contentRevisions.createdAt)).limit(8),
      db.select().from(siteSettings).limit(1),
    ]);

    stats = {
      servicesTotal: allServices.length,
      servicesPublished: allServices.filter((s) => s.status === "published").length,
      pricingTotal: allPricing.length,
      pricingActive: allPricing.filter((p) => p.status === "published").length,
      eventsTotal: allEvents.length,
      eventsPublished: allEvents.filter((e) => e.status === "published").length,
      galleryTotal: allGallery.length,
      galleryPublished: allGallery.filter((g) => g.status === "published").length,
      pagesTotal: allPages.length,
      pagesPublished: allPages.filter((p) => p.status === "published").length,
      mediaAssetsTotal: allMedia.length,
      revisionsCount: revisions.length,
    };

    recentRevisions = revisions;

    if (settingsRow) {
      bureauProfile = {
        businessNameEn: settingsRow.businessNameEn,
        businessNameTe: settingsRow.businessNameTe,
        phoneNumber: settingsRow.phoneNumber,
        whatsappNumber: settingsRow.whatsappNumber,
        isContactVerified: settingsRow.isContactVerified,
      };
    }
  } catch (err) {
    console.error("Failed to fetch dashboard metrics in admin:", err);
  }

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

  const quickLinks = [
    {
      title: "Homepage CMS",
      description:
        "Manage hero banner, bilingual headings, call-to-actions, and dynamic metric highlights.",
      href: "/admin/homepage",
      icon: Sparkles,
      tag: "Live on Homepage",
    },
    {
      title: "Pages & Compliance",
      description:
        "Edit About Us, How It Works, Terms of Service, Privacy Policy, and SEO metadata.",
      href: "/admin/pages",
      icon: FileText,
      tag: "10 Informational Pages",
    },
    {
      title: "Services Catalog",
      description:
        "Manage matchmaking features, personalized assistance, horoscope matching, and privacy control.",
      href: "/admin/services",
      icon: HeartHandshake,
      tag: "Offerings Page",
    },
    {
      title: "Pricing & Memberships",
      description:
        "Manage membership fee tiers, validity durations, package features, and WhatsApp inquiry links.",
      href: "/admin/pricing",
      icon: CreditCard,
      tag: "Pricing Section",
    },
    {
      title: "Marriage Events",
      description:
        "Organize Parichaya Vedika, youth get-togethers, and regional matchmaking meets with cover photos.",
      href: "/admin/events",
      icon: Calendar,
      tag: "Events Section",
    },
    {
      title: "Photo Gallery",
      description:
        "Upload Cloudinary images, manage wedding success carousels, and maintain captions.",
      href: "/admin/gallery",
      icon: ImageIcon,
      tag: "Cloudinary CDN",
    },
    {
      title: "Bureau Settings & Contacts",
      description:
        "Update official phone numbers, WhatsApp, Vijayawada office address, and SEO defaults.",
      href: "/admin/settings",
      icon: Settings,
      tag: "Bureau Config",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Admin Workspace
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time bilingual matrimony content status, Cloudinary media pipeline, and operational
          audit trail.
        </p>
      </div>

      {/* Bureau Status Banner */}
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
              {stats.mediaAssetsTotal} Cloudinary Assets
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

      {/* Metric Cards Grid */}
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

      {/* Management Modules Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Content Management Modules
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct access to all verified administrative modules wired to Cloudflare D1 and
              Cloudinary.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/50 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-lg border border-primary/20 bg-primary/10 p-2.5 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-xs font-semibold text-primary">
                  Manage module
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Audit Revisions */}
      <div id="recent-revisions" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Recent Administrative Activity
            </h2>
            <p className="text-xs text-muted-foreground">
              Immutable audit trail records stored in Cloudflare D1 content revisions.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <History className="size-3.5" />
            Audit Logging Active
          </span>
        </div>

        {recentRevisions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <History className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold text-foreground">No recent revisions</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Edits made across Homepage, Pages, Services, Pricing, Events, and Settings will be
              logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentRevisions.map((rev) => (
                  <tr key={rev.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground capitalize">
                      {rev.entityType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          rev.action === "publish"
                            ? "bg-emerald-100 text-emerald-800"
                            : rev.action === "delete"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {rev.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground truncate max-w-[140px]">
                      {rev.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
