---
description: Get your Homebase personal landing page live in under 10 minutes. Fork the repo, edit site.yaml, configure Cloudflare Pages, and push.
---

# Getting Started

Get your personal landing page live in under 10 minutes.

## Step 1 -- Fork the Repository

1. Go to [https://github.com/ncosentino/homebase](https://github.com/ncosentino/homebase)
2. Click **Fork** in the top-right corner
3. Choose your GitHub account as the destination

You now own a copy of the repo. All changes go in your fork.

## Step 2 -- Edit site.yaml

All personalization lives in `_data/site.yaml`. Open it in your browser via the GitHub UI (click the file, then the pencil icon) or clone locally and edit in your editor.

At minimum, update these fields:

```yaml
profile:
  name: "Your Name"
  username: "@yourhandle"
  bio: "Your bio here."
  avatar: "https://your-avatar-url.com/photo.jpg"

seo:
  title: "Your Name | Your Tagline"
  description: "Your meta description (120-160 characters)."
  canonical: "https://your-domain.com"
  og_image: "https://your-og-image.com/image.jpg"

sections:
  - links:
      - title: "My Website"
        url: "https://yoursite.com"
        icon: "globe"
```

See the [Configuration](configuration.md) page for the full reference.

## Step 3 -- Set Up Cloudflare Pages

Homebase uploads the built site directly to Cloudflare Pages -- no separate hosting repo needed.

1. **Create a Cloudflare Pages project** (one-time): `npx wrangler pages project create your-project-name --production-branch main`, then set `name` in `wrangler.toml` to match
2. **Create an API token** with Cloudflare Pages Edit permission (see [CI/CD](cicd.md) for exact steps)
3. **Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`** as secrets in your homebase fork (Settings → Secrets and variables → Actions)

## Step 4 -- Push to main

Commit any change to `_data/site.yaml` and push to `main`. GitHub Actions will:

1. Install dependencies
2. Build the site with Eleventy
3. Upload `_site/` to Cloudflare Pages as a production deployment
4. Your site goes live at `https://your-project-name.pages.dev` (or your custom domain)

## Custom Domain (Optional)

Set `seo.cname` in `site.yaml` and configure your DNS. See [CI/CD](cicd.md) for details.

## Next Steps

- [Configuration](configuration.md) -- full `site.yaml` reference with all available fields
- [Themes](themes.md) -- switching themes and creating your own
- [SEO & Discoverability](seo.md) -- understanding all the SEO and AEO fields
