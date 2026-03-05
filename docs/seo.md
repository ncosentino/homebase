# SEO Configuration

homebase is optimized for search engines, AI answer engines, and social sharing.

## Fields Reference

### `seo.title`
The `<title>` tag and `og:title`. Keep under 60 characters.

```yaml
seo:
  title: "Dev Leader | Software Engineering"
```

### `seo.description`
The `<meta name="description">` and `og:description`. Keep 120–160 characters.

### `seo.canonical`
The canonical URL for your site (no trailing slash). Used in `<link rel="canonical">`, `og:url`, JSON-LD, and sitemap.

```yaml
seo:
  canonical: "https://links.yoursite.com"
```

### `seo.og_image`
Open Graph image URL. Shown as the preview image when shared on social media. Recommended size: 1200×630px.

### `seo.keywords`
Array of keywords for `<meta name="keywords">`. Not heavily weighted by modern search engines but still included.

## What's Generated

| Tag | Source |
|-----|--------|
| `<title>` | `seo.title` |
| `<meta name="description">` | `seo.description` |
| `<link rel="canonical">` | `seo.canonical` |
| `og:title` | `seo.title` |
| `og:description` | `seo.description` |
| `og:image` | `seo.og_image` |
| `og:url` | `seo.canonical` |
| `og:type` | `profile` (hardcoded) |
| `twitter:card` | `summary_large_image` (hardcoded) |
| Schema.org JSON-LD | `WebPage` type with all fields |

## llms.txt (AEO/GEO)

`llms.txt` is a plain-text file (like `robots.txt`) that AI crawlers and LLM-based answer engines use to understand your site. It's auto-generated from your `site.yaml` config and served at `/llms.txt`.

This helps with **Answer Engine Optimization (AEO)** — making your content appear in AI-generated answers from tools like Perplexity, ChatGPT Browse, and Bing Copilot.

## Google Analytics

Set `analytics.google_analytics_id` in `site.yaml`. Leave blank to disable (no tracking code is injected).

```yaml
analytics:
  google_analytics_id: "G-XXXXXXXXXX"
```
