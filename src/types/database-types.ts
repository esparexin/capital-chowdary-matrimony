import type {
  adminSessions,
  adminUsers,
  contentRevisions,
  contentSections,
  galleryItems,
  loginRateLimits,
  marriageEvents,
  mediaAssets,
  pages,
  pricingPlans,
  services,
  siteSettings,
} from "@/db/schema";

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type AdminSession = typeof adminSessions.$inferSelect;
export type NewAdminSession = typeof adminSessions.$inferInsert;

export type LoginRateLimit = typeof loginRateLimits.$inferSelect;
export type NewLoginRateLimit = typeof loginRateLimits.$inferInsert;

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export type ContentSection = typeof contentSections.$inferSelect;
export type NewContentSection = typeof contentSections.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type NewPricingPlan = typeof pricingPlans.$inferInsert;

export type MarriageEvent = typeof marriageEvents.$inferSelect;
export type NewMarriageEvent = typeof marriageEvents.$inferInsert;

export type GalleryItem = typeof galleryItems.$inferSelect;
export type NewGalleryItem = typeof galleryItems.$inferInsert;

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type NewContentRevision = typeof contentRevisions.$inferInsert;
