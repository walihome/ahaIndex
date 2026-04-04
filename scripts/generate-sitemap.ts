import { writeFileSync } from 'fs';

const SITE_URL = 'https://www.amazingindex.com';
const OSS_BASE = 'https://www.amazingindex.com';

async function generate() {
  try {
    const resp = await fetch(`${OSS_BASE}/api/dates.json`);
    const data = await resp.json();
    const dates = data.dates || [];

    const urlEntries = dates.map((date: string) => `
  <url>
    <loc>${SITE_URL}/daily/${date}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${urlEntries}
</urlset>`;

    writeFileSync('public/sitemap.xml', sitemap, 'utf-8');
    console.log(`✅ Sitemap 生成完成，共 ${dates.length} 个日期页面`);
  } catch (error) {
    console.error('获取日期失败:', error);
    process.exit(1);
  }
}

generate();
