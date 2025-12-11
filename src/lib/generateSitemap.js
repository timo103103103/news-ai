/**
 * Sitemap Generator
 * Run this script to generate sitemap.xml
 * Usage: node src/lib/generateSitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import landing pages data - FIXED PATH
const landingPagesPath = path.join(__dirname, '../data/landingPages.json');
const landingPages = JSON.parse(fs.readFileSync(landingPagesPath, 'utf-8'));

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Define static pages
const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/news-analysis', changefreq: 'weekly', priority: '0.9' },
  { loc: '/pricing', changefreq: 'monthly', priority: '0.8' },
  { loc: '/login', changefreq: 'monthly', priority: '0.5' },
  { loc: '/signup', changefreq: 'monthly', priority: '0.5' },
];

/**
 * Generate sitemap XML
 */
function generateSitemap() {
  const currentDate = new Date().toISOString();
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static pages
  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // Add landing pages
  landingPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${BASE_URL}/landing/${page.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  return `# Allow all crawlers
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml

# Disallow admin and auth pages
Disallow: /admin/
Disallow: /api/
Disallow: /auth/callback
`;
}

/**
 * Main function
 */
function main() {
  try {
    // Generate sitemap
    const sitemap = generateSitemap();
    const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('✅ Sitemap generated:', sitemapPath);

    // Generate robots.txt
    const robotsTxt = generateRobotsTxt();
    const robotsPath = path.join(__dirname, '../../public/robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt);
    console.log('✅ robots.txt generated:', robotsPath);

    console.log(`\n📊 Total URLs in sitemap: ${staticPages.length + landingPages.length}`);
    console.log(`   - Static pages: ${staticPages.length}`);
    console.log(`   - Landing pages: ${landingPages.length}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();
