# VibeCoding — Minimal Static Site

Minimalist, mobile‑first static site ready for GitHub Pages. No frameworks, no build step, just HTML/CSS/JS with accessible patterns and great performance.

## Features
- Semantic HTML with proper landmarks and heading order
- Mobile‑first layout, responsive typography (`clamp()`), CSS Grid/Flex
- Accessible menu toggle with ARIA and keyboard support
- Sci-fi dark theme with neon accents
- Smooth scrolling that respects reduced motion
- Orbitron web font for futuristic feel
- 3D rotating cube on the hero section
- Relative asset paths to work under `/REPO/` and custom domains
- Robots + Sitemap, Open Graph + Twitter meta

## File Tree
```
.
├── 404.html
├── README.md
├── index.html
├── robots.txt
├── script.js
├── sitemap.xml
├── site.webmanifest
├── style.css
└── assets/
    ├── favicon.png
    ├── favicon.svg
    ├── icon-192.png
    ├── icon-512.png
    └── logo.svg
```

## Local Preview
No build step is required. You can open `index.html` directly, but for best results use a local server so relative routing behaves like GitHub Pages.

Option A (Python):

```sh
python3 -m http.server 5173
# then open http://localhost:5173/
```

Option B (Node):

```sh
npx serve -p 5173
# then open http://localhost:5173/
```

## Deploy to GitHub Pages
1. Create a new GitHub repository and push this folder.
2. In GitHub: Settings → Pages → Build and deployment → Source: Deploy from a branch.
3. Select the `main` branch and the root (`/`) folder. Save.
4. Your site will be available at `https://<username>.github.io/<repo>/`.

Notes:
- All paths are relative (e.g. `./assets/...`) so project pages under `/REPO/` work without changes.
- Update canonical/OG meta URLs in `index.html` once your final URL is known.
- Update `sitemap.xml` `<loc>` values to absolute URLs for best SEO.

## Custom Domain (optional)
1. In your DNS, create a `CNAME` record pointing your domain to `username.github.io`.
2. In GitHub: Settings → Pages → Custom domain → enter your domain and enable HTTPS.
3. Add a `CNAME` file at repo root containing your domain (e.g., `example.com`).

## Maintenance Tips
- Keep payload small: avoid large JS; inline nothing critical beyond what’s here.
- Prefer SVG for icons/illustrations; include `width` and `height` attributes.
- Test accessibility: keyboard nav, focus styles, color contrast (WCAG AA).
- Validate with W3C HTML/CSS validators; check Lighthouse in Chrome DevTools.

## License
You own your content. This template is provided as-is; use freely.

