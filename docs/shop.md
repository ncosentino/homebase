---
description: Add an optional shop tab to your Homebase page — configure products, courses, and services with full SEO structured data and GA4 analytics tracking.
---

# Shop

Homebase supports an optional **Shop tab** that adds a configurable storefront at a custom URL path (default `/shop/`). When enabled, it adds:

- A tab bar linking your main Links page to the Shop page
- Configurable collections of cards (courses, services, ebooks, merch, etc.)
- SEO-optimized structured data (`Product`, `Course`, `Service` JSON-LD + `ItemList`)
- Full GA4 analytics: click events **and** impression tracking via `IntersectionObserver`
- Sitemap and `llms.txt` entries so search engines and AI crawlers discover it

The shop is **disabled by default** — existing Homebase sites are unaffected until you opt in.

---

## Enabling the Shop

Set `shop.enabled: true` in `_data/site.yaml`:

```yaml
shop:
  enabled: true
  title: "Shop"
  description: "Courses, guides, and resources for software engineers."
  path: "shop"        # URL path: /shop/ — change to "store", "products", etc.
  date_modified: "2026-07-19T17:46:21.000Z"
  layout: "grid"      # "grid" or "list"
  currency: "USD"
  show_prices: true
  ga_event_name: "shop_item_click"

  collections:
    - id: "courses"
      title: "Courses"
      description: "Level up with hands-on training."
      items:
        - id: "csharp-mastery"
          title: "C# .NET Mastery"
          description: "Comprehensive C# training from beginner to advanced."
          image: "https://example.com/assets/course-thumb.webp"
          url: "https://example.com/courses/csharp"
          type: "course"
          price: 97
          badge: "Bestseller"
          cta_label: "Enroll Now"
```

Rebuild (push to GitHub or run `npm run build` locally) and your Shop tab appears automatically.

---

## Configuring the Path

The shop URL path defaults to `shop` (`/shop/`). Change it to any URL-safe string:

```yaml
shop:
  path: "store"       # Accessible at /store/
```

!!! warning "Change path before launch"
    Changing `path` after users have bookmarked or linked to your shop changes the URL. If you must rename it, add a redirect from the old path.

---

## Collections

Group related items under named collections. Each collection gets its own heading on the page.

```yaml
shop:
  collections:
    - id: "courses"
      title: "Courses"
      description: "Optional subtitle text below the heading."
      items: [ ... ]

    - id: "consulting"
      title: "Consulting"
      items: [ ... ]
```

!!! tip "Collection order"
    Collections appear in the order they are listed in YAML.

---

## Item Types and JSON-LD

The `type` field on each item drives which structured-data entity is emitted.
The entities preserve the meaning of visible offerings independently from any
consumer-specific presentation.

| `type` value | JSON-LD `@type` | Consumer-specific status |
|---|---|---|
| `course` | `Course` + `CourseInstance` + `Offer` | Google phased out Course Info presentation in 2025; the semantic entities remain valid |
| `service` | `Service` + `Offer` | No dedicated Google Service rich result; useful to compatible consumers |
| `consultation` | `Service` + `Offer` | No dedicated Google Service rich result; useful to compatible consumers |
| `ebook`, `merch`, `download`, `link` *(default)* | `Product` + `Offer` | Google product features require visible policy-compliant data and may require additional fields |

All items are wrapped in `ItemList` to preserve their visible order and
relationship to the shop collection. No list presentation is guaranteed.

!!! note "Open enum"
    `type` is an open string — you can use any value. Unknown types fall back to `Product + Offer` and show a generic badge icon on the card.

---

## Item Fields Reference

```yaml
items:
  - id: "my-item"              # Required — stable, never change after launch (used in GA)
    title: "My Item"           # Required — card heading
    url: "https://example.com" # Required — CTA button destination
    description: "Optional description shown in the card body."
    image: "https://example.com/image.webp"  # 16:9 aspect ratio recommended
    type: "course"             # Drives JSON-LD schema (see table above)
    price: 97                  # Numeric. 0 = free. Omit to hide price entirely.
    original_price: 197        # Shown with strikethrough when > price
    currency: "USD"            # Per-item override (defaults to shop.currency)
    badge: "Bestseller"        # Short text badge pill on the card
    cta_label: "Enroll Now"    # Button text (default: "Get It" / "Get It Free")
    featured: false            # true = pinned to top of collection
    ga_label: "csharp-mastery" # Stable GA label — use when title changes seasonally
    utm:                       # Per-item UTM overrides
      source: "homebase"
      medium: "shop"
      campaign: "csharp-mastery"
```

### Price display rules

| `price` value | Card display |
|---|---|
| `97` | `$97 USD` |
| `0` | `Free` |
| omitted / `null` | No price shown |
| `original_price: 197` and `price: 97` | ~~`$197`~~ `$97` |

Set `shop.show_prices: false` to hide prices from cards, analytics attributes,
and structured offers while retaining the configured values for later use.

---

## UTM Tracking

UTM parameters are merged onto item URLs automatically. You can set site-level defaults and override them per item:

```yaml
# Site-level UTM defaults (optional)
utm:
  source: "homebase"
  medium: "shop"

shop:
  collections:
    - items:
        - id: "my-course"
          url: "https://example.com/course"
          utm:
            campaign: "my-course"   # Merged with site-level source + medium
```

The final URL becomes: `https://example.com/course?utm_source=homebase&utm_medium=shop&utm_campaign=my-course`

---

## Layouts

| Value | Description |
|---|---|
| `grid` (default) | Responsive multi-column card grid (`--shop-grid-cols` controls column sizing) |
| `list` | Single-column stacked layout, wider cards suited for text-heavy items |

Set globally via `shop.layout` or plan for per-collection overrides in a future version.

---

## Analytics

See [Analytics → Shop Analytics](analytics.md#shop-analytics) for:

- `shop_item_click` event parameters
- `shop_item_view` impression event
- How to register custom dimensions in GA4
- Building a Shop Exploration report

---

## SEO Details

When the shop is enabled, Homebase emits:

- **Page `<title>`**: `{shop.title} — {seo.title}`
- **Meta description**: `shop.description`
- **Canonical URL**: `{seo.canonical}/{shop.path}/`
- **Open Graph**: Full `og:title`, `og:description`, `og:url`, `og:image` (uses `shop.og_image` if set, otherwise falls back to `seo.og_image`)
- **Twitter Card**: summary card with shop title, description, and image
- **JSON-LD**: Connected `WebSite`, `CollectionPage`, `Person`, breadcrumb, and `ItemList` graph wrapping typed `Product`/`Course`/`Service` + `Offer` nodes
- **Sitemap**: `/{shop.path}/` entry uses `shop.date_modified` for `lastmod` when configured
- **llms.txt**: Shop collections section listing all item titles, types, and URLs

### Setting a shop-specific OG image

```yaml
shop:
  og_image: "https://example.com/assets/shop-og.webp"   # 1200×630px recommended
```

---

## Full YAML Example

```yaml
shop:
  enabled: true
  title: "Shop"
  path: "shop"
  description: "Courses, consulting, and guides for software engineers."
  og_image: "https://example.com/assets/shop-og.webp"
  layout: "grid"
  currency: "USD"
  show_prices: true
  ga_event_name: "shop_item_click"

  collections:
    - id: "courses"
      title: "Courses"
      description: "Hands-on software engineering training."
      items:
        - id: "csharp-mastery"
          title: "C# .NET Mastery"
          description: "Beginner to advanced C# with real-world projects."
          image: "https://example.com/assets/course.webp"
          url: "https://example.com/courses/csharp"
          type: "course"
          price: 97
          original_price: 197
          badge: "Bestseller"
          cta_label: "Enroll Now"
          ga_label: "csharp-mastery"
          utm:
            campaign: "csharp-mastery"

    - id: "consulting"
      title: "Consulting"
      description: "Book a 1:1 session."
      items:
        - id: "consult-30"
          title: "30-Minute Strategy Call"
          description: "Architecture review, career guidance, or technical deep-dive."
          url: "https://calendly.com/example/30min"
          type: "consultation"
          price: 150
          cta_label: "Book Now"

    - id: "ebooks"
      title: "Free Resources"
      items:
        - id: "design-patterns-guide"
          title: "Design Patterns Cheat Sheet"
          description: "Quick reference for the most common software design patterns."
          url: "https://example.com/free/design-patterns"
          type: "ebook"
          price: 0
          cta_label: "Download Free"
```
