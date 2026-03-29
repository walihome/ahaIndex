import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const SITE_URL = 'https://amazingindex.com'; // 根据实际域名修改

async function generate() {
  const { data, error } = await supabase
    .from('display_items')
    .select('snapshot_date')
    .order('snapshot_date', { ascending: false });

  if (error) {
    console.error('获取日期失败:', error);
    process.exit(1);
  }

  const dates = [...new Set(data?.map(d => d.snapshot_date) ?? [])];

  const urlEntries = dates.map(date => `
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
}

generate();
