"use client";

import { Eye, EyeOff, FileText, Loader2, Pencil } from "lucide-react";
import type { Page } from "@/types/database-types";

interface AdminPagesListProps {
  pagesList: Page[];
  actionLoadingId: string | null;
  onEdit: (page: Page) => void;
  onToggleStatus: (page: Page) => void;
}

export function AdminPagesList({
  pagesList,
  actionLoadingId,
  onEdit,
  onToggleStatus,
}: AdminPagesListProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {pagesList.map((page) => {
        const isPublished = page.status === "published";
        const isVerified = page.verificationStatus === "verified";
        const isLoading = actionLoadingId === page.id;

        return (
          <article
            key={page.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="mt-0.5 inline-flex rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary shrink-0">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-foreground">{page.titleEn}</h3>
                  <span className="text-xs text-muted-foreground">({page.titleTe})</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    /{page.slug}
                  </span>
                </div>
                {page.summaryEn && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{page.summaryEn}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-semibold uppercase ${
                      isPublished
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {page.status}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-semibold uppercase ${
                      isVerified
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {page.verificationStatus}
                  </span>
                  <span className="text-muted-foreground">
                    Updated: {new Date(page.updatedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => onToggleStatus(page)}
                disabled={isLoading}
                title={isPublished ? "Unpublish page" : "Publish page"}
                className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : isPublished ? (
                  <>
                    <EyeOff className="size-3.5 text-amber-600" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5 text-emerald-600" />
                    Publish
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onEdit(page)}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
