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

### Newsletter Signup

Captures email addresses and sends them to your newsletter backend. The `backend` value determines what actually renders on the page — some collect email inline, others redirect to a hosted page.

```yaml
integrations:
  newsletter:
    enabled: true
    position: after_profile         # after_profile | after_videos | after_links | bottom
    heading: "Join the Newsletter"
    subheading: "Weekly insights. No spam, ever."
    placeholder: "your@email.com"
    cta_label: "Subscribe"
    backend: formspree              # formspree | convertkit | web3forms | mailchimp_embed | beehiiv_embed | substack
    formspree_id: "xabc1234"        # Sign up at formspree.io (free tier available)
    success_message: "You're in! Check your inbox to confirm."
    gdpr_note: "No spam. Unsubscribe anytime."
```

| `backend` value | What it renders | Email captured on-page? |
|-----------------|-----------------|------------------------|
| `formspree` | Email input + submit button. POSTs to Formspree via AJAX. | ✅ Yes |
| `convertkit` | Email input + submit button. POSTs to Kit/ConvertKit public form endpoint via AJAX. | ✅ Yes |
| `web3forms` | Email input + submit button. POSTs to Web3Forms via AJAX. | ✅ Yes |
| `mailchimp_embed` | Renders Mailchimp's own hosted form (POSTs to Mailchimp directly). | ✅ Yes |
| `beehiiv_embed` | Renders a Beehiiv-hosted subscribe iframe. | ✅ Yes |
| `substack` | **Renders a styled button link only.** Clicking opens `{substack_url}/subscribe` in a new tab. No email input, no form — the user subscribes on Substack's own page. | ❌ No |

!!! note "Substack limitation"
    Substack blocks direct API calls and iframe embeds from external domains. The `substack` backend is therefore just a styled CTA button — it is functionally identical to adding a Substack subscribe link in your regular link sections, with the addition of the newsletter widget card styling and GA4 `widget_view` tracking. If you want to capture emails inline on your page, use `beehiiv_embed` or one of the AJAX backends instead.

| Other fields | Description |
|-------|-------------|
| `formspree_id` | Your Formspree form ID (last segment of the form action URL). |
| `convertkit_form_id` | Your public Kit/ConvertKit form ID. |
| `web3forms_key` | Your Web3Forms access key ([web3forms.com](https://web3forms.com)). |
| `mailchimp_embed_url` | The `action` URL from your Mailchimp embedded form. |
| `beehiiv_publication_id` | Your Beehiiv publication ID (format: `pub_xxxxx`). |
| `substack_url` | Your Substack base URL (e.g. `https://yourname.substack.com`). |
| `gdpr_note` | Optional privacy note rendered below the form. |

### Social Follow Buttons

Platform-branded follow buttons with optional subscriber counts. Renders a clean list of follow buttons styled with each platform's icon.

```yaml
integrations:
  social_follow:
    enabled: true
    position: after_profile
    heading: "Follow Along"
    buttons:
      - platform: youtube
        label: "Subscribe on YouTube"
        url: "https://youtube.com/@yourname?sub_confirmation=1"
        count: "32K"
      - platform: github
        label: "Follow on GitHub"
        url: "https://github.com/yourname"
      - platform: twitter
        label: "Follow on X"
        url: "https://x.com/yourhandle"
```

Supported `platform` values: `youtube`, `github`, `twitter`/`x`, `linkedin`, `discord`, `twitch`, `instagram`, `tiktok`, `bluesky`, `mastodon`.

### Support / Monetization Buttons

Ko-fi, GitHub Sponsors, Buy Me a Coffee, Patreon — or any custom link. Renders a flex row of branded buttons.

```yaml
integrations:
  support_buttons:
    enabled: true
    position: bottom
    heading: "Support the Content"
    buttons:
      - platform: kofi
        label: "Buy Me a Coffee"
        url: "https://ko-fi.com/yourname"
      - platform: github_sponsors
        label: "Sponsor on GitHub"
        url: "https://github.com/sponsors/yourname"
```

Supported `platform` values: `kofi`, `github_sponsors`, `buymeacoffee`, `patreon`.

### Booking Widget

A calendar booking CTA. Renders either a full inline iframe embed or a simple button link.

```yaml
integrations:
  booking:
    enabled: true
    position: after_links
    heading: "Book a Session"
    provider: tidycal               # tidycal | calendly | cal
    embed: false                    # true = inline iframe, false = button link only
    url: "https://tidycal.com/yourhandle/30-mins"
    cta_label: "Book a Call"
    embed_height: 600               # iframe height in px when embed: true
```

### Poll Widget

Embed a [Tally.so](https://tally.so) form or define a custom YAML poll backed by Formspree or Web3Forms.

```yaml
# Tally.so embed
integrations:
  poll:
    enabled: true
    provider: tally
    heading: "Quick Poll"
    tally_form_id: "wMeKBz"
    tally_height: 250

# Custom radio-button poll
integrations:
  poll:
    enabled: true
    provider: custom
    heading: "Quick Poll"
    question: "What's your primary .NET version?"
    options:
      - label: ".NET 8"
        value: "net8"
      - label: ".NET 9"
        value: "net9"
      - label: "Still on .NET Framework"
        value: "netfx"
    backend: formspree
    formspree_id: "xabc1234"
    success_message: "Thanks for your vote!"
```

### Contact Form

A name / email / message form. Submissions route to Formspree or Web3Forms.

```yaml
integrations:
  contact_form:
    enabled: true
    position: after_links
    heading: "Get in Touch"
    show_name: true
    show_subject: false
    backend: formspree
    formspree_id: "xabc1234"
    cta_label: "Send Message"
    success_message: "Message sent! I'll get back to you soon."
```

### Lead Magnet

Collect an email, then reveal a resource URL (PDF, template, guide). Supports all AJAX backends.

```yaml
integrations:
  lead_magnet:
    enabled: true
    position: after_links
    heading: "Free Resource"
    subheading: "Enter your email to get instant access."
    resource_title: "The C# Performance Checklist"
    resource_description: "A 2-page quick-reference guide covering the most common .NET performance pitfalls."
    resource_image: "https://example.com/checklist-preview.png"
    cta_label: "Send Me the Checklist"
    backend: formspree
    formspree_id: "xabc1234"
    resource_url: "https://your-cdn.com/checklist.pdf"
    success_message: "Check your inbox! Your resource is on its way."
```

**Two delivery modes:**

| Mode | How it works | Resource URL in page source? |
|------|-------------|------------------------------|
| Static (`resource_url` set) | URL is embedded in page HTML. Revealed client-side after submit. | ✅ Yes — inspectable |
| Webhook (`backend: webhook`) | Client POSTs to your server. Server validates, records the email, and returns the URL in its response (or delivers it via email). URL never appears in HTML. | ❌ No — server-gated |

**Webhook backend config:**

```yaml
  lead_magnet:
    enabled: true
    backend: webhook
    webhook_url: "https://your-api.example.com/lead-magnet"
    resource_url: ""                # Leave blank — URL comes from the server
    success_message: "Check your inbox! Your resource is on its way."
```

**Webhook contract** — your server receives:
```json
POST {webhook_url}
Content-Type: application/json

{ "email": "user@example.com" }
```

And must respond with one of:

```json
// Option A: reveal URL in-page after submit
{ "resource_url": "https://cdn.example.com/secret-resource.pdf" }

// Option B: deliver resource by email server-side (no URL shown in page)
{}
```

Any non-2xx response, or a response body containing `{ "error": "message" }`, is shown as an error to the user.

### Social Proof Counters

Display audience reach numbers as a stat grid. Values are static — update them in `site.yaml` as your numbers grow.

```yaml
integrations:
  social_proof:
    enabled: true
    position: after_profile
    counters:
      - label: "YouTube subscribers"
        value: "32K+"
      - label: "Newsletter readers"
        value: "4,500+"
      - label: "GitHub followers"
        value: "1,200+"
```

### Discord Community Widget

Embeds the official Discord server widget. Requires **Widget** to be enabled in your server settings (Server Settings → Widget).

```yaml
integrations:
  discord:
    enabled: true
    position: after_links
    server_id: "1234567890"         # Your Discord server's numeric ID
    heading: "Join the Community"
```

### Achievement Badges

Display Credly badges, Stack Overflow user flair, [shields.io](https://shields.io) badges, or custom images.

```yaml
integrations:
  badges:
    enabled: true
    position: after_links
    heading: "Certifications & Achievements"
    items:
      - type: credly
        badge_id: "xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        label: "AWS Certified Developer"
      - type: stackoverflow
        user_id: "1234567"
      - type: shields
        url: "https://img.shields.io/github/stars/user/repo"
        alt: "GitHub Stars"
        link: "https://github.com/user/repo"
      - type: image
        image_url: "https://example.com/mvp-badge.png"
        label: "Microsoft MVP"
        link: "https://mvp.microsoft.com/yourprofile"
```

### Testimonials

A grid of quotes from your audience, collaborators, or press coverage.

```yaml
integrations:
  testimonials:
    enabled: true
    position: after_links
    heading: "What People Say"
    items:
      - quote: "This content changed how I think about software architecture."
        author: "Jane D."
        handle: "@janed"
        url: "https://x.com/janed/status/..."
      - quote: "The best C# newsletter I've read this year."
        author: "Alex K."
        handle: "@alexk"
```

### Live Code / Demo Embeds

Embed interactive code demos from CodePen, GitHub Gist, StackBlitz, or Replit.

```yaml
integrations:
  code_embeds:
    enabled: true
    position: after_links
    heading: "Featured Projects"
    items:
      - provider: codepen
        embed_id: "xxxxx"
        user: "yourname"
        title: "CSS Grid Demo"
        height: 400
      - provider: gist
        gist_id: "yourusername/xxxxxxxxxxxx"
        title: "Useful Extension Methods"
      - provider: stackblitz
        project_id: "xxxxx"
        title: "Live .NET Demo"
        height: 500
```

Supported `provider` values: `codepen`, `gist`, `stackblitz`, `replit`.

### QR Code Widget

Generates a real QR code **at build time** and embeds it directly in the page as an inline SVG — no external services, no network requests, infinitely scalable at any size. The QR code automatically appends UTM parameters so scans are trackable in GA4 as their own source.

Five display modes let you choose how the QR code surfaces — as a standalone card, integrated into the hero banner, or as a floating overlay button — all configurable without touching code.

#### Display modes

| `display` value | Behavior | Requires hero banner? |
|-----------------|----------|-----------------------|
| `widget` | Standalone card at `position` *(default)* | No |
| `compact` | Small card after_profile, no heading | No |
| `flip` | Hero banner becomes a flip card — front=image, back=QR on tap/click | Yes *(falls back to `widget`)* |
| `sticky` | Floating "📱 Scan" pill button fixed to viewport corner; tap opens a modal with full QR | No |
| `badge` | Small QR watermarked into a corner of the hero banner | Yes *(falls back to `widget`)* |
| `sidebyside` | Hero image + QR card in a flex row above the links; stacks on mobile | Yes *(falls back to `widget`)* |

Set `also_sticky: true` to always add the floating sticky button *alongside* any other display mode (e.g. `display: flip` + `also_sticky: true` gives you both).

```yaml
integrations:
  qr_code:
    enabled: true
    display: widget               # widget | compact | flip | sticky | badge | sidebyside
    also_sticky: false            # true = add floating sticky button alongside primary mode
    sticky_corner: bottom_right   # bottom_right | bottom_left
    badge_corner: bottom_right    # bottom_right | bottom_left | top_right | top_left (badge mode)
    badge_size: 80                # QR size in px for the badge overlay
    position: bottom              # after_profile | after_videos | after_links | bottom (widget/compact)
    heading: "Scan to Visit"
    label: ""                     # optional caption below the QR code
    url: ""                       # blank = auto-uses site.seo.canonical
    size: 200                     # width/height in px (QR is always square)
    show_download: true           # adds a "Save QR Code" button (SVG download)
    # Appearance
    color: "#000000"              # dot/module color
    bg_color: ""                  # background color (blank = transparent — card white shows through)
    error_correction: M           # L=compact | M=default | Q=outdoor | H=logo-overlay safe
    margin: 1                     # quiet zone around the code (in modules)
    # Logo overlay (optional — only effective with error_correction: H)
    logo: ""                      # URL or path to an image to stamp in the center
    logo_size: 0                  # logo width/height in px (0 = auto ~30% of QR size)
    # UTM tracking
    utm_medium: qr                # medium always defaults to "qr" (not your site.utm.medium)
    utm_source: ""                # blank = inherits site.utm.source
    utm_campaign: ""              # blank = inherits site.utm.campaign
```

| Field | Default | Description |
|-------|---------|-------------|
| `enabled` | `false` | Set to `true` to generate and display the QR code. |
| `display` | `widget` | How/where the QR appears. See display modes table above. |
| `also_sticky` | `false` | Add a floating sticky button alongside any other mode. |
| `sticky_corner` | `bottom_right` | Corner for the sticky button / modal trigger: `bottom_right` or `bottom_left`. |
| `badge_corner` | `bottom_right` | Corner for badge overlay: `bottom_right`, `bottom_left`, `top_right`, `top_left`. |
| `badge_size` | `80` | Width/height in px for the badge overlay QR. No logo is stamped at badge size. |
| `position` | `bottom` | Page slot for `widget`/`compact` modes: `after_profile`, `after_videos`, `after_links`, `bottom`. |
| `heading` | `"Scan to Visit"` | Heading rendered above the QR code card. |
| `label` | `""` | Optional short caption rendered below the code, above the URL. |
| `url` | `""` | Target URL encoded in the QR code. Leave blank to use `site.seo.canonical`. |
| `size` | `200` | QR code width/height in pixels. The SVG scales cleanly to any size. |
| `show_download` | `true` | Shows a "Save QR Code" download button. Downloads the SVG file. |
| `color` | `"#000000"` | Color of the dark modules (dots). |
| `bg_color` | `""` | Background color. Leave blank for transparent (the white card background shows through). |
| `error_correction` | `M` | Reed-Solomon error correction level. `L` = 7% recoverable, `M` = 15%, `Q` = 25%, `H` = 30%. Use `H` if you add a logo overlay so the logo doesn't break scannability. |
| `margin` | `1` | Number of module-widths of whitespace around the code (the "quiet zone"). |
| `logo` | `""` | Image URL to stamp in the center of the QR code. Only visually effective with `error_correction: H`. |
| `logo_size` | `0` | Logo width/height in px. `0` auto-sizes to ~30% of `size`. |
| `utm_medium` | `"qr"` | UTM medium appended to the encoded URL. Intentionally defaults to `"qr"` (not `site.utm.medium`) so QR scans appear as their own GA4 channel. |
| `utm_source` | `""` | UTM source. Blank inherits `site.utm.source`. |
| `utm_campaign` | `""` | UTM campaign. Blank inherits `site.utm.campaign`. |

!!! tip "Use for print materials"
    The download button saves the QR code as an SVG file, making it print-ready at any resolution. Drop it into a business card, slide deck, or banner — it will be razor-sharp at any size.

!!! note "Build-time generation"
    The QR code is generated once when Eleventy builds your site. There is no JavaScript required to display it (except flip/sticky which use a minimal click handler). Changing `url`, `color`, `display`, or any other option requires a new build to take effect.



Every widget has a `position` key that controls where it appears on the page:

| Value | Renders after |
|-------|---------------|
| `after_profile` | Profile card and social icons |
| `after_videos` | Featured YouTube videos |
| `after_links` | Link sections *(default for most widgets)* |
| `bottom` | All other content *(default for `support_buttons`)* |

### Asset loading

`integrations.css` and `integrations.js` are only loaded when at least one interactive widget (`newsletter`, `social_follow`, `support_buttons`, `booking`, `poll`, `contact_form`, `lead_magnet`, `social_proof`, `discord`, `badges`, `testimonials`, `code_embeds`, or `qr_code`) is enabled. The FAQ widget uses its own CSS in `base.css` and requires no JS. The QR code widget uses `integrations.css` for layout but requires no JS.



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
