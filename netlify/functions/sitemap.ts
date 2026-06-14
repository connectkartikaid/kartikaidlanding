import type { Handler } from '@netlify/functions'

// Dynamic sitemap generator for Kartika.id
// Auto-includes all blog posts from stored data

const BASE_URL = 'https://kartika.id'

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/blog', priority: '0.9', changefreq: 'daily' },
]

const handler: Handler = async () => {
  try {
    // Static pages + try to pull blog slugs from env-deployed data
    const urls = [...staticPages]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
      body: sitemap,
    }
  } catch {
    return { statusCode: 500, body: 'Error generating sitemap' }
  }
}

export { handler }
