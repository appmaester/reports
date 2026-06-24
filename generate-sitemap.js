#!/usr/bin/env node

/**
 * Generate sitemap.xml from reports.json
 * This script automatically creates a sitemap including all reports
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://reports.utetezi.org';
const REPORTS_FILE = './reports.json';
const SITEMAP_FILE = './sitemap.xml';

function generateSitemap() {
  try {
    // Read reports.json
    const reportsData = fs.readFileSync(REPORTS_FILE, 'utf8');
    const reports = JSON.parse(reportsData);

    if (!Array.isArray(reports)) {
      throw new Error('reports.json must contain an array of reports');
    }

    // Generate sitemap entries
    const now = new Date().toISOString().split('T')[0];
    
    const urlEntries = [
      // Main portal page
      `    <url>
      <loc>${BASE_URL}/</loc>
      <lastmod>${now}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>`
    ];

    // Add each report
    reports.forEach(report => {
      if (report.slug) {
        const lastmod = report.modifiedDate || report.publishDate || report.year || now;
        const priority = report.featured ? '0.8' : '0.6';
        const changefreq = report.featured ? 'monthly' : 'monthly';
        
        urlEntries.push(`    <url>
      <loc>${BASE_URL}/${report.slug}/</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`);
      }
    });

    // Generate complete sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n  ')}
</urlset>`;

    // Write sitemap.xml
    fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
    
    console.log(`✅ Sitemap generated successfully with ${reports.length + 1} URLs`);
    console.log(`📄 ${SITEMAP_FILE} updated`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

// Run the script
generateSitemap();