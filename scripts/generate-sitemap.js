import fs from 'fs'
import path from 'path'

const OUT = path.resolve(process.cwd(), 'public', 'sitemap.xml')
const baseUrl = process.env.SITE_URL || 'https://degree-iq.vercel.app'

function listDegreePages() {
  const dataDir = path.resolve(process.cwd(), 'src', 'data')
  if (!fs.existsSync(dataDir)) return []
  return fs
    .readdirSync(dataDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .map(f => `/degree/${path.basename(f, '.json')}`)
}

const routes = ['/', '/onboarding', '/dashboard', ...listDegreePages()]

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map(r => `  <url>\n    <loc>${baseUrl}${r}</loc>\n  </url>`)
  .join('\n')}\n</urlset>`

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, xml, 'utf8')
console.log('Sitemap written to', OUT)
