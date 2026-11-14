import { Plus, Trash2 } from "lucide-react";

interface HighlightItem {
  title: string;
  description: string;
}

interface HomepageHeroHighlightsSectionProps {
  highlights: HighlightItem[];
  onHighlightChange: (index: number, field: "title" | "description", val: string) => void;
  onAddHighlight: () => void;
  onRemoveHighlight: (index: number) => void;
}

export function HomepageHeroHighlightsSection({
  highlights,
  onHighlightChange,
  onAddHighlight,
  onRemoveHighlight,
}: HomepageHeroHighlightsSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Hero Highlights
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Key alliance points shown under the hero heading (e.g. geographic coverage).
          </p>
        </div>
        <button
          type="button"
          onClick={onAddHighlight}
          className="inline-flex items-center gap-1 rounded border border-input px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
        >
          <Plus className="size-3.5" />
          Add Highlight
        </button>
      </div>

      <div className="space-y-3">
        {highlights.map((hl, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
          >
            <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground">
                  Highlight Title
                </label>
                <input
                  type="text"
                  value={hl.title}
                  onChange={(e) => onHighlightChange(idx, "title", e.target.value)}
                  placeholder="e.g. Andhra Pradesh & Telangana"
                  className="mt-0.5 block w-full rounded border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground">
                  Highlight Description
                </label>
                <input
                  type="text"
                  value={hl.description}
                  onChange={(e) => onHighlightChange(idx, "description", e.target.value)}
                  placeholder="e.g. Alliances across both Telugu states"
                  className="mt-0.5 block w-full rounded border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveHighlight(idx)}
              className="mt-4 rounded p-1 text-destructive hover:bg-destructive/10"
              title="Remove highlight"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
