import { RoutePlaceholder } from "@/components/shared/RoutePlaceholder";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <RoutePlaceholder
        sectionLabel="404"
        title="Page Not Found"
        description="The requested page could not be found."
        actionHref="/"
        actionLabel="Return Home"
      />
    </div>
  );
}
