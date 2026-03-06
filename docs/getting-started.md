---
description: Get your Homebase personal landing page live in under 10 minutes. Fork the repo, edit site.yaml, configure your GitHub Pages deploy token, and push.
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

## Step 3 -- Set Up GitHub Pages

Homebase pushes the built site to a separate GitHub Pages repository.

1. **Create your Pages repo** if you don't have one -- it must be named `<youruser>.github.io`
2. **Create a Personal Access Token** with write access to that repo (see [CI/CD](cicd.md) for exact steps)
3. **Add `GH_DEPLOY_TOKEN`** as a secret in your homebase fork (Settings → Secrets and variables → Actions)
4. **Update `DEPLOY_REPO`** in `.github/workflows/deploy.yml` to your Pages repo name

## Step 4 -- Push to main

Commit any change to `_data/site.yaml` and push to `main`. GitHub Actions will:

1. Install dependencies
2. Build the site with Eleventy
3. Push `_site/` to your Pages repo
4. Your site goes live at `https://<youruser>.github.io`

## Custom Domain (Optional)

Set `seo.cname` in `site.yaml` and configure your DNS. See [CI/CD](cicd.md) for details.

## Next Steps

- [Configuration](configuration.md) -- full `site.yaml` reference with all available fields
- [Themes](themes.md) -- switching themes and creating your own
- [SEO & Discoverability](seo.md) -- understanding all the SEO and AEO fields
