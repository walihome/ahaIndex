import os
import json
import urllib.request
import urllib.parse
from datetime import datetime
import oss2

# Configuration
SITE_URL = 'https://amazingindex.com'
OSS_BUCKET_NAME = os.environ.get('OSS_BUCKET', 'amazingindex')
OSS_ENDPOINT = os.environ.get('OSS_ENDPOINT', 'oss-cn-hangzhou.aliyuncs.com')
OSS_ACCESS_KEY_ID = os.environ.get('OSS_ACCESS_KEY_ID')
OSS_ACCESS_KEY_SECRET = os.environ.get('OSS_ACCESS_KEY_SECRET')

def fetch_dates_from_oss(bucket):
    """Fetch the list of published dates from OSS."""
    try:
        # Assuming there's an api/dates.json or similar that lists all available dates
        # If not, we might need to list objects in the daily/ prefix
        dates = set()
        for obj in oss2.ObjectIterator(bucket, prefix='api/daily/'):
            # Extract date from path like api/daily/2026/03/2026-03-29.json
            filename = obj.key.split('/')[-1]
            if filename.endswith('.json'):
                date_str = filename.replace('.json', '')
                dates.add(date_str)
        return sorted(list(dates), reverse=True)
    except Exception as e:
        print(f"Error fetching dates from OSS: {e}")
        return []

def generate_sitemap_xml(dates):
    """Generate the sitemap XML content."""
    urls = []
    
    # Static pages
    static_pages = [
        {'loc': f'{SITE_URL}/', 'priority': '1.0', 'changefreq': 'daily'},
        {'loc': f'{SITE_URL}/daily', 'priority': '0.9', 'changefreq': 'daily'},
        {'loc': f'{SITE_URL}/history', 'priority': '0.8', 'changefreq': 'weekly'},
        {'loc': f'{SITE_URL}/about', 'priority': '0.5', 'changefreq': 'monthly'},
        {'loc': f'{SITE_URL}/contact', 'priority': '0.5', 'changefreq': 'monthly'},
    ]
    
    for page in static_pages:
        urls.append(f"""  <url>
    <loc>{page['loc']}</loc>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>""")

    # Dynamic daily archive pages
    for date in dates:
        urls.append(f"""  <url>
    <loc>{SITE_URL}/daily/{date}</loc>
    <lastmod>{date}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.7</priority>
  </url>""")
        
        # Also add month pages if not already added
        month = date[:7]
        month_url = f"""  <url>
    <loc>{SITE_URL}/daily/{month}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>"""
        if month_url not in urls:
            urls.append(month_url)

    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""
    return xml_content

def upload_to_oss(bucket, content, object_name, content_type):
    """Upload content to OSS."""
    try:
        headers = {'Content-Type': content_type}
        bucket.put_object(object_name, content, headers=headers)
        print(f"Successfully uploaded {object_name} to OSS.")
    except Exception as e:
        print(f"Error uploading {object_name} to OSS: {e}")

def submit_to_google(sitemap_url):
    """Submit the sitemap to Google Search Console."""
    ping_url = f"https://www.google.com/ping?sitemap={urllib.parse.quote(sitemap_url)}"
    try:
        response = urllib.request.urlopen(ping_url)
        if response.status == 200:
            print(f"Successfully submitted sitemap to Google: {sitemap_url}")
        else:
            print(f"Failed to submit sitemap to Google. Status code: {response.status}")
    except Exception as e:
        print(f"Error submitting sitemap to Google: {e}")

def main():
    if not all([OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET]):
        print("Error: OSS credentials not found in environment variables.")
        return

    auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
    bucket = oss2.Bucket(auth, OSS_ENDPOINT, OSS_BUCKET_NAME)

    print("Fetching dates from OSS...")
    dates = fetch_dates_from_oss(bucket)
    print(f"Found {len(dates)} daily briefings.")

    print("Generating sitemap.xml...")
    sitemap_content = generate_sitemap_xml(dates)
    
    print("Uploading sitemap.xml to OSS...")
    upload_to_oss(bucket, sitemap_content, 'sitemap.xml', 'application/xml')
    
    # Also generate and upload robots.txt
    robots_content = f"""User-agent: *
Allow: /

Sitemap: {SITE_URL}/sitemap.xml
"""
    print("Uploading robots.txt to OSS...")
    upload_to_oss(bucket, robots_content, 'robots.txt', 'text/plain')

    print("Submitting to Google Search Console...")
    submit_to_google(f"{SITE_URL}/sitemap.xml")
    
    print("Done!")

if __name__ == '__main__':
    main()
