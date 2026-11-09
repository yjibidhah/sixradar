# SixRadar — GTA VI launch hub (static, free to host)

A complete no-framework, mobile-first fan-site starter with live release-date countdown, original neon background art, Rockstar official video embeds, release information, sharing, animations, SEO metadata and prepared post-launch sections.

## Try it locally

Open `index.html` in your browser, or run `python -m http.server 8000` from this folder and open http://localhost:8000.

## Publish for free

1. Sign into Netlify and use its drag-and-drop site deploy with this folder or its ZIP contents; alternatively use Cloudflare Pages direct upload.
2. Once you have a domain, connect it in the hosting dashboard and set up DNS and HTTPS.
3. Replace the `og:image` path with the full HTTPS URL of your deployed `assets/vice-neon-hero.png` for reliable social thumbnails.
4. Verify your domain in Google Search Console. The site already contains basic HTML titles, page description, heading structure and robots.txt. Once your domain is final, generate an absolute-URL `sitemap.xml` and submit it.
5. Later you can add news pages and actual verified guides. No ads, analytics or paid services are included.

## What the countdown actually represents

It counts down to local midnight at the beginning of **Nov 19, 2026**, using the visitor's device timezone. This is **not** a claim about worldwide console unlock time. Rockstar's currently stated official release date is November 19, 2026, on PS5 and Xbox Series X|S: https://www.rockstargames.com/VI .

## Media and legal notes

- Hero background: original AI-generated city illustration, not Rockstar official imagery.
- Trailer thumbnails: loaded from YouTube and videos are embedded *on click* from Rockstar Games' uploads via youtube-nocookie. Internet is required; some age-restricted videos may play on YouTube only.
- Official media page: https://www.rockstargames.com/VI/media
- This is an **unofficial** fan website, not endorsed by or connected to Rockstar Games. Do not use Rockstar trademarks in a way that implies official affiliation. Consult the platform's media terms before hosting third-party screenshots or adding monetization.

## Editing

- `index.html` — all content, cards, trailers and SEO title/description.
- `styles.css` — responsive styling.
- `script.js` — countdown, social sharing and video dialog.
- `assets/vice-neon-hero.png` — generated original hero art.

## Limits / next steps

- No CMS or database: after-launch guide areas are designed sections but not yet populated with guides.
- No false visitor counters or fake poll numbers.
- Search visibility and advertising approval are not guaranteed.

## Deploy from a GitHub repository to Netlify

1. Keep `index.html`, `styles.css`, `script.js`, `robots.txt`, `netlify.toml` and the `assets/` directory at the repository root.
2. Netlify: **Add new project → Import an existing project → GitHub → choose this repository**.
3. Build command: leave blank. Publish directory: `.` (the `netlify.toml` file also configures this).
4. Deploy. Netlify gives you a free `*.netlify.app` URL. Connect a custom domain later.

No API keys, environment variables, package installation, database, or npm build is necessary.