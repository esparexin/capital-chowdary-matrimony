import { HomeHeroSection } from "@/components/public/HomeHeroSection";
import { HomeOverviewSections } from "@/components/public/HomeOverviewSections";
import { getSiteContactDetails } from "@/features/contact/site-contact";
import { getPublishedServices } from "@/features/cms/public-pages-repo";
import { getHomepageHeroContent } from "@/features/homepage/hero-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [heroContent, services, contact] = await Promise.all([
    getHomepageHeroContent(),
    getPublishedServices(),
    getSiteContactDetails(),
  ]);

  return (
    <div className="-mt-6 space-y-8 sm:-mt-4">
      <HomeHeroSection content={heroContent} />
      <HomeOverviewSections services={services} contact={contact} />
    </div>
  );
}
