---
description: Full reference for _data/site.yaml -- every field for your profile, links, theme, SEO, analytics, YouTube embed, and banner.
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
  avatar: "https://www.devleader.ca/assets/profile-picture.webp"
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name shown above the bio |
| `username` | No | Handle shown below the name (include `@` if desired) |
| `bio` | No | Short description shown under the username |
| `avatar` | No | URL to your profile photo (square recommended, at least 192×192px) |

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
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | `<title>` tag and `og:title`. Keep under 60 characters. |
| `description` | Yes | `<meta name="description">` and `og:description`. 120-160 characters. |
| `canonical` | Yes | Canonical URL (no trailing slash). Used in canonical link, `og:url`, JSON-LD, and sitemap. |
| `og_image` | No | Preview image for social sharing. Recommended 1200×630px. |
| `keywords` | No | Array of keywords for `<meta name="keywords">`. |
| `cname` | No | Custom domain for GitHub Pages. Leave blank to use `yourname.github.io`. |

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

## Full Example

```yaml
profile:
  name: "Dev Leader"
  username: "@devleader"
  bio: "Principal Engineering Manager at Microsoft."
  avatar: "https://www.devleader.ca/assets/profile-picture.webp"

seo:
  title: "Dev Leader | Software Engineering"
  description: "Links and resources from Nick Cosentino."
  canonical: "https://links.devleader.ca"
  og_image: "https://www.devleader.ca/assets/og-image.webp"
  keywords: ["C#", ".NET", "software engineering"]
  cname: "links.devleader.ca"

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
```
