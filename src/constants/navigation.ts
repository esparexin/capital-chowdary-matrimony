export interface NavigationItem {
  href: string;
  labelKey: string;
  defaultLabel: string;
}

export const PUBLIC_NAV_ITEMS: readonly NavigationItem[] = [
  { href: "/", labelKey: "nav.home", defaultLabel: "Home" },
  { href: "/about", labelKey: "nav.about", defaultLabel: "About" },
  { href: "/services", labelKey: "nav.services", defaultLabel: "Services" },
  { href: "/how-it-works", labelKey: "nav.howItWorks", defaultLabel: "How It Works" },
  { href: "/pricing", labelKey: "nav.pricing", defaultLabel: "Plans" },
  { href: "/events", labelKey: "nav.gallery", defaultLabel: "Gallery" },
  { href: "/contact", labelKey: "nav.contact", defaultLabel: "Contact" },
  { href: "/register", labelKey: "nav.register", defaultLabel: "Register" },
] as const;

export const ADMIN_NAV_ITEMS: readonly NavigationItem[] = [
  { href: "/admin/dashboard", labelKey: "admin.dashboard", defaultLabel: "Dashboard" },
  { href: "/admin/homepage", labelKey: "admin.homepage", defaultLabel: "Homepage" },
  { href: "/admin/pages", labelKey: "admin.pages", defaultLabel: "Pages" },
  { href: "/admin/services", labelKey: "admin.services", defaultLabel: "Services" },
  { href: "/admin/pricing", labelKey: "admin.pricing", defaultLabel: "Pricing" },
  { href: "/admin/events", labelKey: "admin.events", defaultLabel: "Events" },
  { href: "/admin/gallery", labelKey: "admin.gallery", defaultLabel: "Gallery" },
  { href: "/admin/settings", labelKey: "admin.settings", defaultLabel: "Settings" },
] as const;
