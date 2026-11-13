import Link from "next/link";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionContainer } from "@/components/shared/MotionContainer";

interface RoutePlaceholderProps {
  sectionLabel: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function RoutePlaceholder({
  sectionLabel,
  title,
  description,
  actionHref,
  actionLabel,
}: RoutePlaceholderProps) {
  return (
    <MotionContainer className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8 shadow-xs">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        <Layers className="size-3.5" aria-hidden="true" />
        <span>{sectionLabel}</span>
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </div>
      ) : null}
    </MotionContainer>
  );
}
