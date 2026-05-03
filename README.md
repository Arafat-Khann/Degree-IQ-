# DegreeIQ

Client-side React app scaffolded with Vite and Tailwind.

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

Notes:
- Data JSON files are under `src/data`.
- Onboarding stores `degreeiq.profile` and `degreeiq.grades` in `localStorage`.

Deployment and SEO:
- The app is set up for Vercel with prerendered snapshots, sitemap generation, and `robots.txt`.
- Before launch, replace the placeholder `https://yourdomain.com` values in `index.html`, `robots.txt`, and the JSON-LD in `src/pages/Landing.jsx`.
- After deployment, submit `https://yourdomain.com/sitemap.xml` in Google Search Console.
- If Search Console asks for ownership verification, use the DNS record method for the cleanest setup on Vercel.
- Re-run `npm run build` before every deploy so prerendered HTML stays in sync with the source pages.
