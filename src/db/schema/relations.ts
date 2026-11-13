import { relations } from "drizzle-orm";
import { adminSessions, adminUsers } from "./admin-schema";
import {
  contentRevisions,
  contentSections,
  galleryItems,
  marriageEvents,
  pages,
} from "./cms-schema";
import { mediaAssets } from "./media-schema";

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(adminSessions),
  uploadedMedia: many(mediaAssets),
  updatedPages: many(pages),
  revisions: many(contentRevisions),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [adminSessions.adminUserId],
    references: [adminUsers.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  uploadedBy: one(adminUsers, {
    fields: [mediaAssets.uploadedByAdminId],
    references: [adminUsers.id],
  }),
  sections: many(contentSections),
  events: many(marriageEvents),
  galleryItems: many(galleryItems),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  updatedBy: one(adminUsers, {
    fields: [pages.updatedByAdminId],
    references: [adminUsers.id],
  }),
  sections: many(contentSections),
}));

export const contentSectionsRelations = relations(contentSections, ({ one }) => ({
  page: one(pages, {
    fields: [contentSections.pageId],
    references: [pages.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [contentSections.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const marriageEventsRelations = relations(marriageEvents, ({ one, many }) => ({
  coverMedia: one(mediaAssets, {
    fields: [marriageEvents.coverMediaAssetId],
    references: [mediaAssets.id],
  }),
  galleryItems: many(galleryItems),
}));

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  event: one(marriageEvents, {
    fields: [galleryItems.eventId],
    references: [marriageEvents.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [galleryItems.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const contentRevisionsRelations = relations(contentRevisions, ({ one }) => ({
  changedBy: one(adminUsers, {
    fields: [contentRevisions.changedByAdminId],
    references: [adminUsers.id],
  }),
}));
