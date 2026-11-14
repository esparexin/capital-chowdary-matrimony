"use client";

import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import type { Service } from "@/types/database-types";

interface AdminServicesListProps {
  servicesList: Service[];
  actionLoadingId: string | null;
  onEdit: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function AdminServicesList({
  servicesList,
  actionLoadingId,
  onEdit,
  onToggleStatus,
  onDelete,
}: AdminServicesListProps) {
  if (servicesList.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
        No matrimonial services found. Click &quot;Add Service&quot; above to create one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {servicesList.map((svc) => {
        const isPublished = svc.status === "published";
        const isLoading = actionLoadingId === svc.id;

        return (
          <article
            key={svc.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="mt-0.5 inline-flex rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary shrink-0">
                <ServiceIcon iconName={svc.iconName} className="size-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-foreground">{svc.titleEn}</h3>
                  <span className="text-xs text-muted-foreground">({svc.titleTe})</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    /{svc.slug}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{svc.descriptionEn}</p>
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-semibold uppercase ${
                      isPublished
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {svc.status}
                  </span>
                  <span className="text-muted-foreground">Order: {svc.sortOrder}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => onToggleStatus(svc)}
                disabled={isLoading}
                title={isPublished ? "Unpublish service" : "Publish service"}
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
                onClick={() => onEdit(svc)}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(svc)}
                disabled={isLoading}
                title="Delete service"
                className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
