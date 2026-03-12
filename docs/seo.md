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
| `og:image` | `seo.og_image` |
| `og:url` | `seo.canonical` |
| `og:type` | `profile` (hardcoded) |
| `twitter:card` | `summary_large_image` (hardcoded) |
| Schema.org JSON-LD | `ProfilePage` + `Person` + `ItemList` |
| `FAQPage` JSON-LD | `integrations.faq.items` (when enabled) |
| `BreadcrumbList` JSON-LD | Auto-generated for home and shop pages |
| `Speakable` JSON-LD | Marks profile bio and FAQ answers for voice assistants |
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

Homebase emits multiple structured data blocks per page. Google and other engines use these to generate rich results and knowledge graph entries.

### ProfilePage + Person + ItemList

Always present. Describes you as a `Person` with your name, bio, social profiles, and links as `ItemList`. This is the primary schema that can populate a knowledge panel.

### FAQPage

Emitted when `integrations.faq.enabled: true`. Eligible for expandable FAQ rich results in Google Search. Each `question`/`answer` pair in `site.yaml` becomes a `Question` + `acceptedAnswer` in the schema. See [Configuration — FAQ Widget](configuration.md#faq-widget).

### BreadcrumbList

Always present. Provides structured navigation hints (Home → Shop) to search engines.

### Speakable

Marks the profile bio (`.profile-bio`) and FAQ answers (`.integration-faq-answer`) as the most voice-assistant-friendly content on the page. Used by Google Assistant and similar systems.

!!! note "Speakable is in beta"
    Google's Speakable feature is currently in beta and primarily targets English-language news content. It is included because it is harmless to emit and may benefit future implementations. [Source: Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/speakable)

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
| `## Content Freshness` | `buildMeta.iso` (build timestamp) |
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

