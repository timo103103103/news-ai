/**
 * SEO Utility Functions
 * Helper functions for SEO optimization
 */

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface JsonLd {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(options: {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image?: string;
  type?: string;
  publishDate?: string;
}): MetaTag[] {
  const { title, description, keywords, url, image, type = 'website', publishDate } = options;

  const tags: MetaTag[] = [
    // Basic meta
    { name: 'description', content: description },
    { name: 'keywords', content: keywords.join(', ') },
    
    // Open Graph
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];

  if (image) {
    tags.push(
      { property: 'og:image', content: image },
      { name: 'twitter:image', content: image }
    );
  }

  if (publishDate) {
    tags.push({ property: 'article:published_time', content: publishDate });
  }

  return tags;
}

/**
 * Generate JSON-LD schema for a page
 */
export function generateWebPageSchema(options: {
  url: string;
  title: string;
  description: string;
  image?: string;
  publishDate?: string;
  modifiedDate?: string;
}): JsonLd {
  const { url, title, description, image, publishDate, modifiedDate } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    },
    'headline': title,
    'description': description,
    'image': image,
    'datePublished': publishDate || new Date().toISOString(),
    'dateModified': modifiedDate || new Date().toISOString(),
    'author': {
      '@type': 'Organization',
      'name': 'News AI Intelligence Platform'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'News AI',
      'logo': {
        '@type': 'ImageObject',
        'url': (import.meta as any).env?.DEV ? '/favicon.svg' : 'https://nexverisai.com/images/logo.png'
      }
    }
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'News AI Intelligence Platform',
    'url': (import.meta as any).env?.DEV ? 'http://localhost:5173' : 'https://nexverisai.com',
    'logo': (import.meta as any).env?.DEV ? '/favicon.svg' : 'https://nexverisai.com/images/logo.png',
    'description': 'AI-powered news analysis platform providing bias detection, PESTLE analysis, sentiment analysis, and market impact predictions.',
    'sameAs': [
      // Add your social media URLs here
      // 'https://twitter.com/newsai',
      // 'https://linkedin.com/company/newsai'
    ]
  };
}

/**
 * Generate SoftwareApplication schema
 */
export function generateSoftwareSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'News AI Intelligence Platform',
    'applicationCategory': 'BusinessApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '150'
    }
  };
}

/**
 * Sanitize and truncate text for meta descriptions
 */
export function sanitizeMetaDescription(text: string, maxLength: number = 160): string {
  // Remove HTML tags
  let clean = text.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // Truncate if needed
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength - 3) + '...';
  }
  
  return clean;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = (import.meta as any).env?.DEV ? 'http://localhost:5173' : 'https://nexverisai.com';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Generate structured data script tag content
 */
export function generateStructuredDataScript(schema: JsonLd | JsonLd[]): string {
  return JSON.stringify(Array.isArray(schema) ? schema : [schema]);
}
