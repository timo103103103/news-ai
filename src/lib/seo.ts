export function buildReportJsonLd(params: {
  title: string;
  description: string;
  date: string;
  entities?: string | string[];
}) {
  const entities =
    Array.isArray(params.entities) ? params.entities : (params.entities ? [params.entities] : []);
  return {
    "@context": "https://schema.org",
    "@type": "Report",
    "headline": params.title,
    "description": params.description,
    "datePublished": params.date,
    "publisher": {
      "@type": "Organization",
      "name": "NexVeris",
      "url": "https://nexverisai.com"
    },
    "author": {
      "@type": "Organization",
      "name": "NexVeris Intelligence Platform"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "NexVeris Intelligence Platform",
      "url": "https://nexverisai.com"
    },
    ...(entities.length > 0 ? { about: entities.map((e) => ({ "@type": "Thing", "name": e })) } : {})
  };
}
