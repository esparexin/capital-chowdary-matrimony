import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  HeartHandshake,
  Image as ImageIcon,
  Settings,
  Sparkles,
} from "lucide-react";

export function DashboardQuickLinks() {
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
  );
}
