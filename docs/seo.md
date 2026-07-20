---
description: How Homebase generates title tags, meta descriptions, Open Graph, Twitter Card, JSON-LD, sitemap, robots.txt, llms.txt, and llms-full.txt from your site.yaml configuration.
---

# SEO & Discoverability

Homebase is optimized for search engines, AI answer engines (AEO), generative engine optimization (GEO), and social sharing out of the box.

## Fields Reference

### `seo.title`

The `<title>` tag and `og:title`. Keep under 60 characters.

```yaml
seo:
  title: "Dev Leader | Software Engineering"
```

### `seo.description`

The `<meta name="description">` and `og:description`. Keep 120-160 characters.

### `seo.canonical`

The canonical URL for your site (no trailing slash). Used in `<link rel="canonical">`, `og:url`, JSON-LD, and sitemap.

```yaml
seo:
  canonical: "https://links.yoursite.com"
```

### `seo.og_image`

Open Graph image URL. Shown as the preview image when shared on social media. Recommended size: 1200×630px.

### `seo.og_image_auto` / `seo.og_image_brand_color`

When `og_image_auto: true`, Homebase generates a 1200×630 PNG at build time and uses it for all `og:image`, `twitter:image`, and JSON-LD image references. The image composites your brand color background, a circular avatar (from `profile.avatar`), your name, tagline, and site URL.

```yaml
seo:
  og_image_auto: false            # set true to enable; false by default
  og_image_brand_color: "#1E2330" # optional background color override
```

| Field | Default | Description |
|-------|---------|-------------|
| `og_image_auto` | `false` | Set to `true` to generate `src/assets/og-image-auto.png` before each build. |
| `og_image_brand_color` | `"#1E2330"` | Hex background color for the generated image. |

!!! note "Requires `@napi-rs/canvas`"
    The generator uses `@napi-rs/canvas` (a devDependency with prebuilt native bindings). It is triggered by Eleventy's `eleventy.before` event and works in GitHub Actions without extra setup. When auto mode is active, `og:image` dimensions are reported as 1200×630 (PNG).

### `seo.keywords`

Array of keywords for `<meta name="keywords">`. Not heavily weighted by modern search engines but still included.

### `seo.person.correction_notes`

Array of factual statements written into your `llms.txt` to anchor AI-generated answers. Use this to prevent LLMs from hallucinating wrong job titles, affiliations, or product attributions.

```yaml
seo:
  person:
    correction_notes:
      - "All content is independent and does not represent my employer's views."
      - "My SaaS product is separate from my personal brand."
```

### `seo.person.wikidata_id`

Your [Wikidata](https://www.wikidata.org) entity ID (e.g. `"Q12345678"`). When set, appends `https://www.wikidata.org/wiki/{wikidata_id}` to the `Person.sameAs[]` array in your JSON-LD.

```yaml
seo:
  person:
    # wikidata_id: "Q12345678"   # Find or create your entity at wikidata.org
```

!!! tip "Highest-trust Knowledge Panel signal"
    Wikidata is the primary source Google's Knowledge Graph uses to verify real-world entities. Adding your Wikidata Q-ID is the highest-trust `sameAs` signal for triggering or enriching a Google Knowledge Panel. Most users will not have a Wikidata entry — this field is commented out by default. If you do have one, it is the single highest-value SEO addition you can make here.

## What Gets Generated

| Tag / File | Source |
|-----|--------|
| `<title>` | `seo.title` |
| `<meta name="description">` | `seo.description` |
| `<meta name="author">` | `profile.name` |
| `<link rel="canonical">` | `seo.canonical` |
| `<link rel="me">` | All entries in `socials` (IndieAuth / Mastodon identity) |
| `og:title` | `seo.title` |
| `og:description` | `seo.description` |
| `og:image` | `seo.og_image` (or auto-generated PNG when `seo.og_image_auto: true`) |
| `og:image` dimensions | 1200×630 when `seo.og_image_auto: true` |
| `og:url` | `seo.canonical` |
| `og:type` | `profile` (hardcoded) |
| `twitter:card` | `summary_large_image` (hardcoded) |
| `twitter:image` | Same as `og:image` |
| Schema.org JSON-LD | Page-aware `WebSite` graph with `ProfilePage` or `CollectionPage`, `Person`, and `ItemList` |
| `FAQPage` JSON-LD | `integrations.faq.items` (when enabled) |
| `BreadcrumbList` JSON-LD | Auto-generated for home and shop pages |
| `Speakable` JSON-LD | Marks profile bio and FAQ answers for voice assistants |
| `VideoObject` JSON-LD | One per video from `youtube_channels` feed or `featured_videos` |
| Standalone `Review` + `AggregateRating` entities referencing `Person` | Visible `integrations.testimonials` items and ratings |
| `/sitemap.xml` | `seo.canonical` + all page URLs |
| `/robots.txt` | Auto-generated (see below) |
| `/llms.txt` | Auto-generated from `site.yaml` (see below) |
| `/llms-full.txt` | Auto-generated, full-text companion (see below) |

## Identity Meta Tags

Every page emits `author`, `creator`, and `publisher` meta tags automatically from your profile and SEO config:

```html
<meta name="author" content="Dev Leader" />
<meta name="creator" content="Dev Leader" />
<meta name="publisher" content="Dev Leader | Software Engineering" />
```

A `<link rel="me">` tag is emitted for every URL in your `socials` array. This is used by Mastodon and IndieAuth to verify that your social profiles belong to the same identity.

## JSON-LD Schemas

Homebase emits one connected JSON-LD graph per page. The graph provides
consumer-neutral structured semantics; specific presentation features depend
on each search engine or application.

### WebSite + ProfilePage + Person + ItemList

The home page emits one connected graph describing the site, profile page,
creator identity, links, optional FAQ content, videos, reviews, and breadcrumb.
Stable `@id` references connect the entities without duplicating their data.

### Shop CollectionPage

The shop route emits a `CollectionPage` whose canonical URL matches the shop
page. It references the same stable `WebSite` and `Person` entities and uses a
page-scoped `ItemList` and breadcrumb.

### FAQPage

Emitted when `integrations.faq.enabled: true`. Eligible for expandable FAQ rich results in Google Search. Each `question`/`answer` pair in `site.yaml` becomes a `Question` + `acceptedAnswer` in the schema. See [Configuration — FAQ Widget](configuration.md#faq-widget).

### BreadcrumbList

Always present. Provides structured navigation hints (Home → Shop) to search engines.

### Speakable

Marks the profile bio (`.profile-bio`) and FAQ answers (`.integration-faq-answer`) as the most voice-assistant-friendly content on the page. Used by Google Assistant and similar systems.

!!! note "Speakable is in beta"
    Google's Speakable feature is currently in beta and primarily targets English-language news content. It is included because it is harmless to emit and may benefit future implementations. [Source: Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/speakable)

### VideoObject

Emitted automatically as one `VideoObject` entity per video from your
`youtube_channels` live feed or `featured_videos` fallback.

`thumbnailUrl`, `contentUrl`, and `embedUrl` are auto-derived from the video's
`youtube_id`. The `uploadDate` is extracted from the YouTube Atom feed (Option
A) or from the `upload_date` field supplied on each `featured_videos` entry
(Option B). When no accurate date is available, Homebase preserves the video
entity and omits `uploadDate`.

See [Configuration — Featured Videos](configuration.md#featured-videos) for the `description` and `upload_date` fields.

### Review + AggregateRating

Emitted automatically when `integrations.testimonials.enabled: true` and at
least one testimonial item exists:

- one standalone `Review` entity per visible testimonial, with
  `itemReviewed` referencing the stable `Person`;
- one standalone `AggregateRating` when at least one testimonial has a numeric
  rating, calculated from the visible rated testimonials and referencing the
  same reviewed `Person`.

This preserves the review relationship without attaching properties whose
Schema.org domain excludes `Person`. Google does not support `Person` review
snippets.

## OG Image Auto Generation

When `seo.og_image_auto: true`, Homebase generates `src/assets/og-image-auto.png` (1200×630) before each build using `scripts/generate-og-image.js`. The image is then used everywhere `og:image`, `twitter:image`, and JSON-LD image references appear — you do not need to set `seo.og_image` separately.

The generated image composites:

- Brand color background (`seo.og_image_brand_color`, default `#1E2330`)
- Circular avatar from `profile.avatar`
- Display name from `profile.name`
- Tagline / bio text
- Site URL from `seo.canonical`

```yaml
seo:
  og_image_auto: false            # set true to enable
  og_image_brand_color: "#1E2330" # optional background color override
```

!!! note "Build-time only"
    The image is regenerated on every build. To preview it locally, run `npm run build` and open `src/assets/og-image-auto.png`. The generator runs as part of Eleventy's `eleventy.before` event, so it is always up to date before pages are rendered.

## llms.txt (AEO/GEO)

`llms.txt` is a plain-text file (analogous to `robots.txt`) that AI crawlers and LLM-based answer engines read to understand your identity and content. It is auto-generated and served at `/llms.txt`.

!!! tip "What is AEO/GEO?"
    Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) are practices for ensuring your content appears in AI-generated answers from Perplexity, ChatGPT Browse, Bing Copilot, and similar tools. `llms.txt` is the emerging convention for signaling structured identity to these systems. [Spec: llmstxt.org](https://llmstxt.org)

The generated `llms.txt` includes these sections, all driven by `site.yaml`:

| Section | Source |
|---|---|
| `## Canonical Identity` | `profile.name`, `profile.username`, `profile.location`, `profile.language`, `seo.canonical` |
| `## Correction Notes` | `seo.person.correction_notes[]` + a default disclaimer |
| `## About` | `seo.llms_about` (falls back to `seo.description`) |
| `## Topics` | `seo.llms_topics[]` |
| `## Content Formats` | `seo.llms_content_formats[]` |
| `## Audience` | `seo.llms_audience` |
| `## Frequently Asked Questions` | `integrations.faq.items[]` (when enabled) |
| `## Links` | All links from `sections` |
| `## Social Profiles` | All visible entries in `socials` |
| `## Content Metadata` | `seo.date_modified` (when configured) + generated-file timestamp |
| `## Shop` | `shop.collections` (when shop is enabled) |

## llms-full.txt (Full Content Companion)

A full-text companion to `llms.txt` served at `/llms-full.txt`. Per the [llmstxt.org spec](https://llmstxt.org), this file provides the complete page content for AI systems that want to ingest more context — extended bio, full link descriptions, complete FAQ answers, and detailed shop item descriptions.

The `## Correction Notes`, `## Canonical Identity`, and `## Frequently Asked Questions` sections are identical to `llms.txt`. Additional sections include:

| Section | Source |
|---|---|
| `## Full Bio` | `profile.ai_summary` + `profile.extended_bio` |
| `## All Links` | All sections and links with descriptions |
| `## Products & Services` | Full shop items with descriptions and pricing |

## robots.txt

Auto-generated. Allows all standard crawlers and explicitly allows 14 AI-specific crawlers by name so they are never accidentally blocked by wildcard deny rules:

| Crawler | Operator |
|---|---|
| `GPTBot` | OpenAI |
| `OAI-SearchBot` | OpenAI |
| `ChatGPT-User` | OpenAI |
| `ClaudeBot` | Anthropic |
| `Claude-SearchBot` | Anthropic |
| `anthropic-ai` | Anthropic |
| `PerplexityBot` | Perplexity |
| `Google-Extended` | Google |
| `PhindBot` | Phind |
| `YouBot` | You.com |
| `Applebot-Extended` | Apple |
| `CCBot` | Common Crawl (LLM pre-training datasets) |
| `Bytespider` | ByteDance |
| `Amazonbot` | Amazon |

The `robots.txt` also includes a comment pointing crawlers to `/llms.txt` and `/llms-full.txt` for structured content.

## sitemap.xml

Auto-generated from `seo.canonical`. Submitted to Google Search Console at `/sitemap.xml`.

## Google Analytics

Set `analytics.google_analytics_id` in `site.yaml`. Leave blank to disable (no tracking code is injected).

```yaml
analytics:
  google_analytics_id: "G-XXXXXXXXXX"
```
