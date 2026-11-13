import type { ReactNode } from "react";

interface PublicPageFrameProps {
  children: ReactNode;
}

export function PublicPageFrame({ children }: PublicPageFrameProps) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">{children}</div>;
}
