# Next.js SSR Migration Guide

## Goals
- Server-side render public pages for crawlability and faster indexing
- Preserve current app flows while incrementally moving SEO-critical routes

## Target Pages (Phase 1)
- `/` Home
- `/pricing`
- `/landing/[slug]`

## Data Access
- Use server components or `getServerSideProps` to fetch page data
- Avoid client-only sources (e.g., `sessionStorage`) for public SEO pages

## Example: Home (pages directory)
```tsx
// pages/index.tsx
import Head from 'next/head'

export async function getServerSideProps() {
  // Fetch marketing data or feature flags
  const data = { title: 'AI News Analysis | NexVeris' }
  return { props: { data } }
}

export default function Home({ data }) {
  return (
    <>
      <Head>
        <title>{data.title}</title>
        <meta name="description" content="AI-powered news analysis: credibility, bias, incentive structures, market impact." />
        <link rel="canonical" href="https://nexverisai.com/" />
      </Head>
      <main>
        {/* Render hero, input, and SEO-rich sections */}
      </main>
    </>
  )
}
```

## Example: App Router (app directory)
```tsx
// app/page.tsx
export default async function Page() {
  // Server component – data fetched on the server
  const data = { title: 'AI News Analysis | NexVeris' }
  return (
    <>
      {/* Use next/head in app router via metadata or a client component wrapper */}
      <main>{/* content */}</main>
    </>
  )
}
```

## Hydration Notes
- Keep charts (Recharts) and dynamic visualizations as client components
- Pass only required props from server to avoid hydration mismatch
- Use `dynamic(() => import('...'), { ssr: false })` for complex client-only widgets

## Routing
- Map existing routes to Next.js pages/app
- Preserve `/results` as client-side for authenticated analysis; add a public SSR preview page for marketing

## Structured Data
- Render JSON-LD via server (`Head`) for public pages (WebSite, Organization, FAQ, Article)
- Avoid client-only injection for critical schemas

## Sitemaps & Robots
- Implement `/sitemap.xml` and `/robots.txt` using Next.js route handlers (app router) or pages API routes
- Include landing pages and static pages

## Incremental Plan
1. Create Next.js app alongside current app (or separate repo)
2. Port `/`, `/pricing`, `/landing/[slug]` with metas & JSON-LD
3. Keep auth & analysis flows in current app initially
4. Deploy behind a subpath or subdomain; switch DNS when validated

## Measurement
- Compare index coverage, impressions, CTR using Search Console
- Track performance via Web Vitals and Lighthouse
