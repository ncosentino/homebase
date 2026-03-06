# homebase

A fully config-driven, SEO-optimized, linktree-style landing page powered by [Eleventy (11ty)](https://www.11ty.dev/).

**[Live demo →](https://github.devleader.ca)**

## ✨ Features

- 🚀 **Blazing fast** — static HTML, no JavaScript required for the page itself
- 🎨 **Themeable** — 3 built-in themes (`devleader`, `minimal`, `neon`), or create your own
- 📱 **Responsive** — mobile-first layout
- 🔍 **SEO-optimized** — title, meta description, canonical, Open Graph, Twitter Card, JSON-LD Schema.org
- 🤖 **AEO/GEO-optimized** — `llms.txt` for AI answer engines (Perplexity, ChatGPT Browse, etc.)
- 🎬 **YouTube embed** — lite-youtube thumbnail → iframe (zero perf cost until clicked)
- 📄 **sitemap.xml + robots.txt** — auto-generated from config
- 🔒 **No secrets in repo** — deploy token is a GitHub Actions secret only

## 🚀 Quick Start (Fork & Customize)

1. **Fork this repo** on GitHub
2. **Edit `_data/site.yaml`** — change the profile, links, theme, and SEO fields to your own
3. **Set up the deploy token** — see [docs/cicd.md](docs/cicd.md)
4. **Push to `main`** — GitHub Actions builds and deploys automatically

That's it. No code changes needed.

## 📁 Project Structure

```
homebase/
├── _data/
│   └── site.yaml          ← ALL personalization lives here (edit this!)
├── src/
│   ├── index.njk          ← main page template
│   ├── llms.txt.njk       ← AI/LLM crawler file
│   ├── robots.txt.njk     ← search engine crawler file
│   ├── sitemap.xml.njk    ← sitemap
│   ├── CNAME              ← custom domain (edit or delete)
│   ├── _includes/         ← Nunjucks partials
│   ├── assets/            ← base CSS + lite-youtube.js
│   ├── themes/            ← theme CSS files
│   └── icons/             ← SVG brand icons
├── .eleventy.js           ← 11ty configuration
├── package.json
└── .github/workflows/
    ├── deploy.yml              ← CI/CD (builds + pushes to Pages repo; manual trigger also builds docs)
    └── scheduled-rebuild.yml  ← periodic rebuild (keeps YouTube feed fresh)
```

## ⚙️ Configuration (`_data/site.yaml`)

All content is controlled by a single YAML file. Key sections:

### Profile
```yaml
profile:
  name: "Your Name"
  username: "@yourhandle"
  bio: "Your bio here."
  avatar: "https://your-avatar-url.com/photo.jpg"
```

### SEO
```yaml
seo:
  title: "Page Title"
  description: "Meta description for search engines."
  canonical: "https://your-domain.com"
  og_image: "https://your-og-image-url.com/image.jpg"
  keywords: ["keyword1", "keyword2"]
```

### Analytics

GA4 is injected at build time via a CI secret — it's never stored in the repo.
Add `GOOGLE_ANALYTICS_ID` as a GitHub Actions secret (see [docs/cicd.md](docs/cicd.md)).
Leave the secret unset to disable analytics entirely.

### Theme
```yaml
theme: devleader   # devleader | minimal | neon | <custom folder name>
```

### Featured Videos

**Option A — Live YouTube channel feed** (fetches latest video at build time, no API key needed):
```yaml
youtube_channels:
  - channel_id: "UCxxxxxxxxxxxxxxxxxxxxx"   # find at youtube.com/@handle/about
    name: "My Channel"
    max_videos: 1
```

**Option B — Hard-coded specific videos** (fallback if `youtube_channels` is empty):
```yaml
featured_videos:
  - youtube_id: "dQw4w9WgXcQ"
    title: "Video title"
```

Leave both empty to hide the video section entirely.

### Link Sections
```yaml
sections:
  - links:
      - title: "My Website"
        url: "https://example.com"
        icon: "globe"

  - title: "Social"
    links:
      - title: "Twitter"
        url: "https://twitter.com/yourhandle"
        icon: "twitter"
```

**Available icons:** `devto`, `discord`, `dzone`, `facebook`, `github`, `globe`, `hackernoon`, `hashnode`, `instagram`, `linkedin`, `mastodon`, `medium`, `patreon`, `quora`, `reddit`, `stackoverflow`, `tiktok`, `twitter`, `youtube`

## 🎨 Themes

See [docs/themes.md](docs/themes.md) for details on built-in themes and creating custom themes.

## 🔧 Local Development

```bash
npm install
npm start       # dev server at http://localhost:8080 with live reload
npm run build   # production build to _site/
```

## 🚢 CI/CD Deployment

See [docs/cicd.md](docs/cicd.md) for full setup instructions.

The workflow in `.github/workflows/deploy.yml` builds the site and force-pushes `_site/` to your GitHub Pages repo on every push to `main`.

A second `docs` job in the same workflow builds and publishes the MkDocs documentation site. It runs on **push to main and manual dispatch**, but is skipped on the scheduled cron rebuild to avoid unnecessary doc regeneration.

## 📖 Documentation

- [docs/themes.md](docs/themes.md) — using and creating themes
- [docs/cicd.md](docs/cicd.md) — deploy token setup and workflow configuration
- [docs/seo.md](docs/seo.md) — SEO fields reference and best practices
