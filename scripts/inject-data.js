import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OSS_URL = 'https://www.amazingindex.com/api/latest.json';
const INDEX_HTML_PATH = path.resolve(__dirname, '../index.html');

async function injectData() {
  try {
    console.log(`Fetching latest data from ${OSS_URL}...`);
    const response = await fetch(OSS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    let html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

    // Remove existing injected data if any (useful for local dev rebuilds)
    html = html.replace(/<script id="preloaded-data">[\s\S]*?<\/script>/, '');

    const scriptTag = `
    <script id="preloaded-data">
      window.__PRELOADED_DATA__ = ${JSON.stringify(data)};
    </script>
    `;

    // Inject before </head>
    html = html.replace('</head>', `${scriptTag}</head>`);

    fs.writeFileSync(INDEX_HTML_PATH, html, 'utf-8');
    console.log('Successfully injected preloaded data into index.html');
  } catch (error) {
    console.warn('⚠️ Failed to fetch or inject preloaded data. Falling back to client-side fetch.');
    console.warn(error);
  }
}

injectData();
