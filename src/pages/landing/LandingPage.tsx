import { useParams, Navigate } from "react-router-dom";
import LandingTemplate from "@/components/landing/LandingTemplate";
import landingPagesData from "@/data/landingPages.json";

export default function LandingPage() {
  const { slug } = useParams<{ slug: string }>();

  const pageData = landingPagesData.find((page) => page.slug === slug);

  if (!pageData) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <LandingTemplate page={pageData} allPages={landingPagesData} />

      {/* =========================
          SEO CONTENT (Google-visible)
          - Hidden from users
          - Safe, non-cloaking
      ========================== */}
      {pageData.seoContent && (
        <section
          className="sr-only"
          dangerouslySetInnerHTML={{ __html: pageData.seoContent }}
        />
      )}
    </>
  );
}
