"use client";

import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { formatInrAmount } from "@/features/cms/public-offerings-repo";
import type { PricingPlan } from "@/types/database-types";

interface AdminPricingListProps {
  plansList: PricingPlan[];
  actionLoadingId: string | null;
  onEdit: (plan: PricingPlan) => void;
  onToggleStatus: (plan: PricingPlan) => void;
  onDelete: (plan: PricingPlan) => void;
}

export function AdminPricingList({
  plansList,
  actionLoadingId,
  onEdit,
  onToggleStatus,
  onDelete,
}: AdminPricingListProps) {
  if (plansList.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
        No pricing plans found. Click &quot;Add Plan&quot; above to create one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {plansList.map((plan) => {
        const isPublished = plan.status === "published";
        const isLoading = actionLoadingId === plan.id;

        return (
          <article
            key={plan.id}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-foreground">
                  {plan.categoryEn}
                </h3>
                <span className="text-xs text-muted-foreground">({plan.categoryTe})</span>
                <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  /{plan.slug}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Reg Fee:{" "}
                  <strong className="text-foreground">
                    {formatInrAmount(plan.registrationFeeInr)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Male:{" "}
                  <strong className="text-foreground">
                    {formatInrAmount(plan.maleCommissionInr)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Female:{" "}
                  <strong className="text-foreground">
                    {formatInrAmount(plan.femaleCommissionInr)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Validity: <strong className="text-foreground">{plan.validityMonths}m</strong>
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1">{plan.termsEn}</p>

              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 font-semibold uppercase ${
                    isPublished
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {plan.status}
                </span>
                <span className="text-muted-foreground">Order: {plan.sortOrder}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
              <button
                type="button"
                onClick={() => onToggleStatus(plan)}
                disabled={isLoading}
                title={isPublished ? "Unpublish plan" : "Publish plan"}
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
                onClick={() => onEdit(plan)}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(plan)}
                disabled={isLoading}
                title="Delete plan"
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
