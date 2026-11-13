import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { contentSections, pages, services } from "@/db/schema";
import {
  DEFAULT_CONTENT_SECTIONS,
  DEFAULT_PAGES,
  DEFAULT_SERVICES,
  TERMS_ACCEPTANCE_EN,
  TERMS_ACCEPTANCE_TE,
  TERMS_CONDITIONS_EN,
  TERMS_CONDITIONS_TE,
} from "@/db/seed/default-content";
import type { ContentSection, Page, Service } from "@/types/database-types";

export interface ProcessStepItem {
  step: number;
  en: string;
  te: string;
}

export interface PublishedPageResult {
  source: "d1" | "d1-unpublished" | "fallback";
  page: Pick<
    Page,
    "slug" | "titleEn" | "titleTe" | "summaryEn" | "summaryTe" | "bodyEn" | "bodyTe"
  > | null;
  sections: ReadonlyArray<
    Pick<
      ContentSection,
      | "sectionKey"
      | "titleEn"
      | "titleTe"
      | "subtitleEn"
      | "subtitleTe"
      | "bodyEn"
      | "bodyTe"
      | "metadataJson"
    >
  >;
}

const processStepsSchema = z.object({
  steps: z.array(
    z.object({
      step: z.number().int().positive(),
      en: z.string().min(1),
      te: z.string().min(1),
    }),
  ),
});

const legalListsSchema = z.object({
  conditionsEn: z.array(z.string().min(1)).optional(),
  conditionsTe: z.array(z.string().min(1)).optional(),
  pointsEn: z.array(z.string().min(1)).optional(),
  pointsTe: z.array(z.string().min(1)).optional(),
});

function getFallbackPage(slug: string): PublishedPageResult {
  const defaultPage = DEFAULT_PAGES.find((item) => item.slug === slug);
  if (!defaultPage) {
    return { source: "fallback", page: null, sections: [] };
  }

  const defaultSections = DEFAULT_CONTENT_SECTIONS.filter(
    (section) => section.pageId === defaultPage.id,
  ).map((section) => ({
    sectionKey: section.sectionKey,
    titleEn: section.titleEn ?? "",
    titleTe: section.titleTe ?? "",
    subtitleEn: section.subtitleEn ?? "",
    subtitleTe: section.subtitleTe ?? "",
    bodyEn: section.bodyEn ?? "",
    bodyTe: section.bodyTe ?? "",
    metadataJson: section.metadataJson ?? "{}",
  }));

  return {
    source: "fallback",
    page: {
      slug: defaultPage.slug,
      titleEn: defaultPage.titleEn,
      titleTe: defaultPage.titleTe,
      summaryEn: defaultPage.summaryEn ?? "",
      summaryTe: defaultPage.summaryTe ?? "",
      bodyEn: defaultPage.bodyEn ?? "",
      bodyTe: defaultPage.bodyTe ?? "",
    },
    sections: defaultSections,
  };
}

/**
 * Fetches a page and its published content sections from D1 by slug.
 * Respects CMS `draft`/`archived` status when D1 records exist, and falls back to seed defaults if D1 is unmigrated or unseeded.
 */
export async function getPublishedPageWithSections(slug: string): Promise<PublishedPageResult> {
  try {
    const db = await getDatabase();
    const [pageRow] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);

    if (!pageRow) {
      return getFallbackPage(slug);
    }

    if (pageRow.status !== "published") {
      return { source: "d1-unpublished", page: null, sections: [] };
    }

    const sectionRows = await db
      .select({
        sectionKey: contentSections.sectionKey,
        titleEn: contentSections.titleEn,
        titleTe: contentSections.titleTe,
        subtitleEn: contentSections.subtitleEn,
        subtitleTe: contentSections.subtitleTe,
        bodyEn: contentSections.bodyEn,
        bodyTe: contentSections.bodyTe,
        metadataJson: contentSections.metadataJson,
      })
      .from(contentSections)
      .where(and(eq(contentSections.pageId, pageRow.id), eq(contentSections.status, "published")))
      .orderBy(asc(contentSections.sortOrder));

    return {
      source: "d1",
      page: pageRow,
      sections: sectionRows,
    };
  } catch {
    return getFallbackPage(slug);
  }
}

/**
 * Fetches published services from D1 ordered by `sortOrder`.
 * Returns an empty array if D1 has service rows but none published; falls back to seed defaults when unseeded/unmigrated.
 */
export async function getPublishedServices(): Promise<
  ReadonlyArray<
    Pick<
      Service,
      "id" | "slug" | "titleEn" | "titleTe" | "descriptionEn" | "descriptionTe" | "iconName"
    >
  >
> {
  try {
    const db = await getDatabase();
    const publishedRows = await db
      .select({
        id: services.id,
        slug: services.slug,
        titleEn: services.titleEn,
        titleTe: services.titleTe,
        descriptionEn: services.descriptionEn,
        descriptionTe: services.descriptionTe,
        iconName: services.iconName,
      })
      .from(services)
      .where(eq(services.status, "published"))
      .orderBy(asc(services.sortOrder));

    if (publishedRows.length > 0) {
      return publishedRows;
    }

    const [anyRow] = await db.select({ id: services.id }).from(services).limit(1);
    return anyRow
      ? []
      : DEFAULT_SERVICES.map((item) => ({ ...item, iconName: item.iconName ?? "HeartHandshake" }));
  } catch {
    return DEFAULT_SERVICES.map((item) => ({
      ...item,
      iconName: item.iconName ?? "HeartHandshake",
    }));
  }
}

export function extractProcessSteps(
  sections: PublishedPageResult["sections"],
): readonly ProcessStepItem[] {
  const stepSection = sections.find((section) => section.sectionKey === "process_steps");
  if (stepSection?.metadataJson) {
    try {
      const parsed = processStepsSchema.safeParse(JSON.parse(stepSection.metadataJson));
      if (parsed.success && parsed.data.steps.length > 0) {
        return parsed.data.steps;
      }
    } catch {
      // Fallback below
    }
  }

  const fallback = getFallbackPage("how-it-works").sections[0];
  if (fallback?.metadataJson) {
    const parsed = processStepsSchema.safeParse(JSON.parse(fallback.metadataJson));
    if (parsed.success) return parsed.data.steps;
  }
  return [];
}

function stripNumericPrefix(text: string): string {
  return text.replace(/^\d+[\.\)]\s*/, "");
}

export function extractTermsLists(sections: PublishedPageResult["sections"]) {
  const conditionsSection = sections.find((s) => s.sectionKey === "terms_conditions");
  const acceptanceSection = sections.find((s) => s.sectionKey === "terms_acceptance");

  let conditionsEn = TERMS_CONDITIONS_EN;
  let conditionsTe = TERMS_CONDITIONS_TE;
  let acceptanceEn = TERMS_ACCEPTANCE_EN;
  let acceptanceTe = TERMS_ACCEPTANCE_TE;

  if (conditionsSection?.metadataJson) {
    try {
      const parsed = legalListsSchema.safeParse(JSON.parse(conditionsSection.metadataJson));
      if (parsed.success) {
        if (parsed.data.conditionsEn?.length) conditionsEn = parsed.data.conditionsEn;
        if (parsed.data.conditionsTe?.length) conditionsTe = parsed.data.conditionsTe;
      }
    } catch {
      // Preserve verified legal text
    }
  }

  if (acceptanceSection?.metadataJson) {
    try {
      const parsed = legalListsSchema.safeParse(JSON.parse(acceptanceSection.metadataJson));
      if (parsed.success) {
        if (parsed.data.pointsEn?.length) acceptanceEn = parsed.data.pointsEn;
        if (parsed.data.pointsTe?.length) acceptanceTe = parsed.data.pointsTe;
      }
    } catch {
      // Preserve verified legal text
    }
  }

  return {
    conditionsEn: conditionsEn.map(stripNumericPrefix),
    conditionsTe: conditionsTe.map(stripNumericPrefix),
    acceptanceEn,
    acceptanceTe,
  };
}
