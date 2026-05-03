#!/usr/bin/env node
/*
 Post-build prerender script:
 - Runs `npx vite preview --port 5174`
 - Uses playwright-chromium to navigate routes and save rendered HTML into `dist/prerendered/`
 - Kills the preview server when done
*/
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import http from 'http'
import { chromium } from 'playwright-chromium'

// Skip prerender when running inside Vercel build environment
if (process.env.VERCEL) {
  console.log('Detected Vercel build environment — skipping prerender to avoid Playwright system dependency issues.')
  process.exit(0)
}

const PORT = 5174
const HOST = `http://localhost:${PORT}`
function listDegreeRoutes() {
  const dataDir = path.resolve(process.cwd(), 'src', 'data')
  if (!fs.existsSync(dataDir)) return []
  return fs
    .readdirSync(dataDir)
    .filter(f => f.endsWith('.json'))
    .map(f => `/degree/${path.basename(f, '.json')}`)
}

const ROUTES = ['/', '/onboarding', '/dashboard', ...listDegreeRoutes()]

function waitForServer(url, timeout = 20000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    (function check() {
      const req = http.get(url, res => {
        res.destroy()
        resolve()
      })
      req.on('error', () => {
        if (Date.now() - start > timeout) return reject(new Error('Server did not start'))
        setTimeout(check, 250)
      })
    })()
  })
}

async function run() {
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { stdio: 'inherit', shell: true })

  try {
    await waitForServer(HOST)
  } catch (err) {
    console.error('Preview server failed to start:', err)
    preview.kill()
    process.exit(1)
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()

  const outDir = path.resolve(process.cwd(), 'dist', 'prerendered')
  fs.mkdirSync(outDir, { recursive: true })

  for (const route of ROUTES) {
    const url = `${HOST}${route}`
    console.log('Prerendering', url)
    await page.goto(url, { waitUntil: 'networkidle' })
    const html = await page.content()
    const filename = route === '/' ? 'index.html' : `${route.replace(/\//g, '_')}.html`
    fs.writeFileSync(path.join(outDir, filename), html, 'utf8')
    console.log('Saved', filename)
  }

  await browser.close()
  preview.kill()
  console.log('Prerender complete — files in', outDir)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
