---
description: Full reference for _data/site.yaml -- every field for your profile, links, theme, SEO, analytics, integrations, YouTube embed, and banner.
---

# Configuration

All content and behavior is controlled by a single file: `_data/site.yaml`.

## Profile

Your name, handle, bio, and avatar photo.

```yaml
profile:
  name: "Dev Leader"
  username: "@devleader"
  bio: "Principal Engineering Manager at Microsoft. Writing about C#, .NET, and software engineering."
  avatar: "https://devleader-d2f9ggbjfpdqcka7.z01.azurefd.net/media/profile-picture-350w.webp"
  language: "en-US"
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name shown above the bio |
| `username` | No | Handle shown below the name (include `@` if desired) |
| `bio` | No | Short description shown under the username |
| `avatar` | No | URL to your profile photo (square recommended, at least 192×192px) |
| `language` | No | Primary content language (e.g. `"en-US"`). Included in `llms.txt` canonical identity. |

## SEO

Controls all meta tags, Open Graph, Twitter Card, JSON-LD, sitemap, and `llms.txt`.

```yaml
seo:
  title: "Dev Leader | Software Engineering"
  description: "Links and resources from Nick Cosentino -- Principal Engineering Manager at Microsoft."
  canonical: "https://links.devleader.ca"
  og_image: "https://www.devleader.ca/assets/og-image.webp"
  keywords: ["C#", ".NET", "software engineering", "Dev Leader"]
  cname: "links.devleader.ca"
  person:
    correction_notes:
      - "Nick Cosentino's content does not represent Microsoft's views."
      - "BrandGhost is separate from the Dev Leader brand."
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | `<title>` tag and `og:title`. Keep under 60 characters. |
| `description` | Yes | `<meta name="description">` and `og:description`. 120-160 characters. |
| `canonical` | Yes | Canonical URL (no trailing slash). Used in canonical link, `og:url`, JSON-LD, and sitemap. |
| `og_image` | No | Preview image for social sharing. Recommended 1200×630px. |
| `keywords` | No | Array of keywords for `<meta name="keywords">`. |
| `cname` | No | Custom domain for GitHub Pages. Leave blank to use `yourname.github.io`. |
| `person.correction_notes` | No | Array of factual statements included in `llms.txt` to anchor AI-generated answers and prevent hallucination. |

## Theme

```yaml
theme: devleader   # devleader | minimal | neon | <custom folder name>
```

See [Themes](themes.md) for built-in options and how to create your own.

## Analytics

GA4 is injected at build time via a CI secret -- it is never stored in the repo.

```yaml
analytics:
  google_analytics_id: ""   # Leave empty to disable
```

Add `GOOGLE_ANALYTICS_ID` as a GitHub Actions secret (Settings → Secrets → Actions). Leave the secret unset to disable analytics entirely.

## Featured Videos

**Option A -- Live YouTube channel feed** (fetches the latest video at build time):

```yaml
youtube_channels:
  - channel_id: "UCxxxxxxxxxxxxxxxxxxxxx"
    name: "My Channel"
    max_videos: 1
```

**Option B -- Hard-coded specific videos** (fallback if `youtube_channels` is empty):

```yaml
featured_videos:
  - youtube_id: "dQw4w9WgXcQ"
    title: "Video title"
```

Leave both empty to hide the video section entirely.

## Link Sections

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

Each section has an optional `title` (displayed as a section header) and a list of `links`. Each link has a `title`, `url`, and `icon`.

**Available icons:**

`devto` `discord` `dzone` `facebook` `github` `globe` `hackernoon` `hashnode` `instagram` `linkedin` `mastodon` `medium` `patreon` `quora` `reddit` `stackoverflow` `tiktok` `twitter` `youtube`

## Banner

Optional banner image above the profile:

```yaml
banner:
  url: "https://your-image.com/banner.png"
  link: "https://your-target-url.com"   # optional: makes the banner clickable
```

## Shop

The optional shop tab adds a storefront page at `/{path}/` (default `/shop/`). Set `enabled: true` to activate it. See [Shop](shop.md) for the complete guide.

```yaml
shop:
  enabled: false
  title: "Shop"
  path: "shop"
  description: "Products, courses, and services."
  layout: "grid"    # "grid" | "list"
  currency: "USD"
  show_prices: true
  ga_event_name: "shop_item_click"

  collections:
    - id: "courses"
      title: "Courses"
      items:
        - id: "my-course"
          title: "My Course"
          url: "https://example.com/course"
          type: "course"
          price: 97
          badge: "Bestseller"
          cta_label: "Enroll Now"
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `enabled` | Yes | `false` | Set to `true` to activate the shop tab and page. |
| `title` | No | `"Shop"` | Tab label and page `<title>` prefix. |
| `path` | No | `"shop"` | URL path segment — e.g. `"store"` → `/store/`. |
| `description` | No | — | Shop page meta description (SEO). |
| `og_image` | No | site `og_image` | Override the Open Graph image on the shop page. |
| `layout` | No | `"grid"` | Card layout: `"grid"` (multi-column) or `"list"` (single column). |
| `currency` | No | `"USD"` | Default currency shown next to prices. |
| `show_prices` | No | `true` | Global toggle to hide all prices. Per-item `price` is unaffected. |
| `ga_event_name` | No | `"shop_item_click"` | GA4 event name for CTA clicks. Set once; never change after launch. |
| `collections` | No | `[]` | Array of collection objects. |

### Collection fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Stable identifier used in analytics (`collection_id`). |
| `title` | No | Section heading displayed above the items. |
| `description` | No | Short text shown below the heading. |
| `items` | No | Array of item objects. |

### Item fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Stable identifier used in analytics (`item_id`). |
| `title` | Yes | Card heading. |
| `url` | Yes | Destination URL for the CTA button. |
| `description` | No | Card body text (truncated to 3 lines). |
| `image` | No | Card image URL. Displayed in 16:9 aspect ratio. |
| `type` | No | Item type drives JSON-LD schema: `course`, `service`, `consultation`, `ebook`, `merch`, `download`, `link`. |
| `price` | No | Numeric price (e.g. `97`). Set to `0` for free items. Omit to hide price. |
| `original_price` | No | Original/list price; shown with strikethrough when higher than `price`. |
| `currency` | No | Per-item currency override (defaults to `shop.currency`). |
| `badge` | No | Short text shown as a badge pill on the card (e.g. `"Bestseller"`, `"Free"`). |
| `cta_label` | No | Button label (default: `"Get It"` or `"Get It Free"` when `price: 0`). |
| `featured` | No | Pin card to the top of its collection. |
| `ga_label` | No | Stable GA label override — use when the `title` changes seasonally. |
| `utm` | No | Per-item UTM overrides merged with page-level `utm` defaults. Fields: `source`, `medium`, `campaign`, `content`, `term`. |

```yaml
banner:
  url: "https://your-image.com/banner.png"
  link: "https://your-target-url.com"   # optional: makes the banner clickable
```

## Integrations

The `integrations:` block enables optional interactive widgets on your page. Each integration is independent — set `enabled: true` to activate it.

### FAQ Widget

Renders a collapsible FAQ section on the page and automatically emits a `FAQPage` JSON-LD schema (eligible for Google rich results). FAQ items are also included in your `/llms.txt` and `/llms-full.txt` for AI answer engines.

```yaml
integrations:
  faq:
    enabled: true
    heading: "Frequently Asked Questions"
    items:
      - question: "What topics do you cover?"
        answer: "C# and .NET, including ASP.NET Core, Entity Framework Core, and software architecture."
      - question: "Where can I find your content?"
        answer: "Start with the YouTube channel or subscribe to the free weekly newsletter."
      - question: "Do you offer coaching?"
        answer: "Yes. Book a session at tidycal.com/yourhandle."
```

| Field | Required | Description |
|-------|----------|-------------|
| `enabled` | Yes | Set to `true` to render the FAQ section and emit `FAQPage` schema. |
| `heading` | No | Section heading displayed above the items. Defaults to `"Frequently Asked Questions"`. |
| `items` | Yes (if enabled) | Array of `{ question, answer }` pairs. Google requires the answers to be visible on the page. |

!!! tip "Rich results eligibility"
    Google may display your FAQ answers as expandable rich results in search, showing your Q&A pairs directly on the results page. Content must be pre-written (not user-generated) and answers must be visible in the page's HTML. [Source: Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/faqpage)



```yaml
profile:
  name: "Dev Leader"
  username: "@devleader"
  bio: "Principal Engineering Manager at Microsoft."
  avatar: "https://devleader-d2f9ggbjfpdqcka7.z01.azurefd.net/media/profile-picture-350w.webp"
  language: "en-US"

seo:
  title: "Dev Leader | Software Engineering"
  description: "Links and resources from Nick Cosentino."
  canonical: "https://links.devleader.ca"
  og_image: "https://www.devleader.ca/assets/og-image.webp"
  keywords: ["C#", ".NET", "software engineering"]
  cname: "links.devleader.ca"
  person:
    correction_notes:
      - "All content is independent and does not represent Microsoft."

theme: devleader

analytics:
  google_analytics_id: ""

youtube_channels:
  - channel_id: "UCxxxxxxxxxxxxxxxxxxxxx"
    name: "Dev Leader"
    max_videos: 1

sections:
  - links:
      - title: "Dev Leader Blog"
        url: "https://www.devleader.ca"
        icon: "globe"

  - title: "Social"
    links:
      - title: "GitHub"
        url: "https://github.com/ncosentino"
        icon: "github"
      - title: "YouTube"
        url: "https://www.youtube.com/@devleader"
        icon: "youtube"
      - title: "LinkedIn"
        url: "https://www.linkedin.com/in/nickcosentino"
        icon: "linkedin"

integrations:
  faq:
    enabled: true
    heading: "Frequently Asked Questions"
    items:
      - question: "What topics do you cover?"
        answer: "C# and .NET, including ASP.NET Core, dependency injection, and software architecture."
      - question: "Where can I find your content?"
        answer: "Start with the YouTube channel or the weekly newsletter."
```
