import { desc } from "drizzle-orm";
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
import {
  DashboardBureauBanner,
  type BureauProfileData,
} from "@/components/admin/dashboard/DashboardBureauBanner";
import {
  DashboardMetricCards,
  type DashboardStats,
} from "@/components/admin/dashboard/DashboardMetricCards";
import { DashboardQuickLinks } from "@/components/admin/dashboard/DashboardQuickLinks";
import {
  DashboardRecentRevisions,
  type DashboardRevisionRecord,
} from "@/components/admin/dashboard/DashboardRecentRevisions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats: DashboardStats = {
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

  let recentRevisions: DashboardRevisionRecord[] = [];
  let bureauProfile: BureauProfileData | null = null;

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

  return (
    <div className="space-y-8">
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

      <DashboardBureauBanner
        bureauProfile={bureauProfile}
        mediaAssetsTotal={stats.mediaAssetsTotal}
      />

      <DashboardMetricCards stats={stats} />

      <DashboardQuickLinks />

      <DashboardRecentRevisions recentRevisions={recentRevisions} />
    </div>
  );
}
