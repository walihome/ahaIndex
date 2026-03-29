import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const OSS_BASE = 'https://amazingindex.oss-cn-hangzhou.aliyuncs.com';
const SITE_URL = 'https://www.amazingindex.com';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function prerender() {
  // 1. 获取所有日期
  let dates;
  try {
    const resp = await fetch(`${OSS_BASE}/api/dates.json`);
    const json = await resp.json();
    dates = Array.isArray(json) ? json : json.dates;
  } catch (e) {
    console.error('Failed to fetch dates.json:', e);
    return;
  }

  if (!Array.isArray(dates)) {
    console.error('dates is not an array:', dates);
    return;
  }

  const baseHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');
  let totalArticles = 0;

  for (const date of dates) {
    const [year, month] = [date.slice(0, 4), date.slice(5, 7)];

    // 2. 获取当天数据
    let data;
    try {
      const resp = await fetch(`${OSS_BASE}/api/daily/${year}/${month}/${date}.json`);
      if (!resp.ok) continue;
      data = await resp.json();
    } catch { continue; }

    const dataScript = `<script id="preloaded-data">window.__PRELOADED_DATA__=${JSON.stringify(data)};</script>`;

    // 3. 日期列表页
    const dailyDir = path.join(DIST, 'daily', date);
    fs.mkdirSync(dailyDir, { recursive: true });

    const dailyTitle = escapeHtml(`${date} AI 简报 - AmazingIndex`);
    const dailyDesc = escapeHtml(`${date} AI 行业精选简报，${data.items?.length || 0} 条创新洞察`);

    const dailyHtml = baseHtml
      .replace(
        '<title>AmazingIndex | 每日创新洞察报告</title>',
        `<title>${dailyTitle}</title>
    <meta name="description" content="${dailyDesc}" />
    <meta property="og:title" content="${dailyTitle}" />
    <meta property="og:description" content="${dailyDesc}" />
    <meta property="og:url" content="${SITE_URL}/daily/${date}" />
    <link rel="canonical" href="${SITE_URL}/daily/${date}" />`
      )
      .replace(/<script id="preloaded-data">[\s\S]*?<\/script>/, dataScript);

    fs.writeFileSync(path.join(dailyDir, 'index.html'), dailyHtml);

    // 4. 文章详情页
    if (!data.items) continue;
    for (const item of data.items) {
      const pid = item.processed_item_id;
      if (!pid) continue;

      const articleDir = path.join(dailyDir, 'article', pid);
      fs.mkdirSync(articleDir, { recursive: true });

      const title = escapeHtml(item.processed_title || 'AmazingIndex');
      const desc = escapeHtml((item.summary || '').slice(0, 150));
      const articleUrl = `${SITE_URL}/daily/${date}/article/${pid}`;

      const articleHtml = baseHtml
        .replace(
          '<title>AmazingIndex | 每日创新洞察报告</title>',
          `<title>${title} - AmazingIndex</title>
    <meta name="description" content="${desc}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${articleUrl}" />
    <link rel="canonical" href="${articleUrl}" />`
        )
        .replace(/<script id="preloaded-data">[\s\S]*?<\/script>/, dataScript);

      fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml);
      totalArticles++;
    }
  }

  console.log(`✅ Prerender complete: ${dates.length} days, ${totalArticles} articles`);
}

prerender();
