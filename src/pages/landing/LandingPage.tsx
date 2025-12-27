import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LandingTemplate from "@/components/landing/LandingTemplate";
import landingPagesData from "@/data/landingPages.json";

export default function LandingPage() {
  const { slug } = useParams<{ slug: string }>();

  const pageData = landingPagesData.find((page) => page.slug === slug);

  if (!pageData) {
    return <Navigate to="/404" replace />;
  }

  const canonicalUrl = `https://www.nexverisai.com/landing/${pageData.slug}`;

  return (
    <>
      {/* =========================
          SEO CORE (CRITICAL)
      ========================== */}
      <Helmet>
        <title>{pageData.metaTitle}</title>
        <meta name="description" content={pageData.metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Optional but powerful */}
        <meta property="og:title" content={pageData.metaTitle} />
        <meta property="og:description" content={pageData.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* =========================
          USER-FACING CONTENT
      ========================== */}
      <main>
        <LandingTemplate page={pageData} allPages={landingPagesData} />
      </main>

      {/* =========================
          SEO TEXT CONTENT
          - Visible to Google
          - Hidden from UI
          - Non-cloaking (safe)
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
