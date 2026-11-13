import type { ReactNode } from "react";

interface AdminSectionFrameProps {
  children: ReactNode;
}

export function AdminSectionFrame({ children }: AdminSectionFrameProps) {
  return <section className="space-y-6">{children}</section>;
}
