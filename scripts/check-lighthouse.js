const fs = require('fs')
const path = require('path')

const reportPath = path.resolve(process.cwd(), 'lighthouse', 'report.json')
if (!fs.existsSync(reportPath)) {
  console.error('Lighthouse report not found at', reportPath)
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
const categories = data.categories || {}

const thresholds = {
  performance: 0.9,
  accessibility: 0.9,
  'best-practices': 0.9,
  seo: 0.9,
}

const failures = []
for (const [key, min] of Object.entries(thresholds)) {
  const cat = categories[key]
  if (!cat) continue
  const score = (typeof cat.score === 'number') ? cat.score : 0
  if (score < min) {
    failures.push({ key, score, min })
  }
}

if (failures.length) {
  console.error('Lighthouse thresholds failed:')
  failures.forEach(f => console.error(` - ${f.key}: ${f.score} < ${f.min}`))
  process.exit(2)
}

console.log('Lighthouse thresholds met')
process.exit(0)
