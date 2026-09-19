# Obligio website review — September 18, 2026

Published to https://obligio.com/ using Netlify project `18c50e89-a921-4d07-8254-d2684fa593dd`.
Production deploy: https://app.netlify.com/projects/obligio/deploys/6aacc04948646f18a6068957

## Changes

- Added the existing app's calendar/checkmark logo to the header, footer and homepage, plus favicon and Apple touch icon. Original brand artwork reused unchanged.
- Reworked the responsive landing page with clearer product, feature, Free/Plus and FAQ content. App release is accurately described as pending. No live download links or watch availability claims added.
- Added unique descriptions, canonical URLs, Open Graph/Twitter previews and icons to all four pages.
- Added Organization and WebSite JSON-LD without invented ratings, reviews or testimonials.
- Added robots.txt and a four-URL XML sitemap using the HTTPS non-www canonical domain.
- Preserved existing legal and support page body text. Launch inquiries use the user's supplied admin@royalnationllc.com address. The example obligation panel is explicitly labelled illustrative.

## Verification

- Netlify authentication and linked project confirmed; HTTPS enforced.
- Preview inspected at desktop and 390px mobile viewport; no horizontal overflow or broken images. Viewport restored afterward.
- All four pages have exactly one H1, description and canonical URL; local internal-link checks passed; JSON-LD and sitemap XML parsed.
- Preview HTTP checks: four pages, logo, favicon, robots.txt and sitemap returned 200 with correct content types. Unknown URL returned 404.
- Production homepage rendered with the new logo and content. Production route/redirect checks saved in `build/release-review/seo-live-checks.json`.
- Static deployment uses `netlify deploy --prod --dir=web --no-build`; automatic build detection attempted an unrelated Expo command, so the existing static HTML/CSS was deployed directly.

## Google Search Console

- Domain property is accessible and verified.
- Overview: 1 search click; 3 indexed and 3 excluded URLs, report last updated September 14. Insufficient field data for Core Web Vitals.
- All 3 excluded examples are expected redirects: http://obligio.com/, http://www.obligio.com/ and https://www.obligio.com/. These should not be forced into the index.
- There were no submitted sitemaps. Submitted https://obligio.com/sitemap.xml; Google returned **Success** and discovered **4 pages**.
- URL inspection confirms the canonical homepage is already on Google and indexed over HTTPS. Requested recrawl of the updated homepage; Google confirmed **Indexing requested** and added it to the priority crawl queue.
- Search Console flagged one unused ownership-verification token. Left unchanged because this is an access-management decision, not a ranking fix.

Indexing and search-result appearance remain controlled by Google; no ranking or rich-result guarantee is implied. No app-store submission was changed in this website task.
