import { useParams, Navigate } from 'react-router-dom';
import LandingTemplate from '@/components/landing/LandingTemplate';
import landingPagesData from '@/data/landingPages.json';

export default function LandingPage() {
  const { slug } = useParams<{ slug: string }>();

  // Find the page data
  const pageData = landingPagesData.find(page => page.slug === slug);

  // If page not found, redirect to 404
  if (!pageData) {
    return <Navigate to="/404" replace />;
  }

  return (
    <LandingTemplate 
      page={pageData} 
      allPages={landingPagesData}
    />
  );
}
