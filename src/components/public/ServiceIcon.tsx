import { ClipboardList, Compass, Handshake, HeartHandshake, Users } from "lucide-react";

interface ServiceIconProps {
  iconName: string;
  className?: string;
}

/**
 * Resolves a stored CMS Lucide icon identifier safely for public service cards.
 */
export function ServiceIcon({ iconName, className = "size-5 text-[#70243B]" }: ServiceIconProps) {
  switch (iconName) {
    case "ClipboardList":
      return <ClipboardList className={className} aria-hidden="true" />;
    case "Users":
      return <Users className={className} aria-hidden="true" />;
    case "Handshake":
      return <Handshake className={className} aria-hidden="true" />;
    case "Compass":
      return <Compass className={className} aria-hidden="true" />;
    default:
      return <HeartHandshake className={className} aria-hidden="true" />;
  }
}
