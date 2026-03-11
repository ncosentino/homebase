---
description: How to track link clicks in Google Analytics using Homebase's built-in event tracking, configure custom dimensions, and build an Exploration report.
---

# Analytics

Homebase automatically tracks every link click and sends structured events to Google Analytics 4 (GA4). This gives you full visibility into which links your audience clicks, where they came from, and which sections of your page drive the most engagement — without any third-party analytics tool.

## Prerequisites

GA tracking must be enabled. Set the `GOOGLE_ANALYTICS_ID` environment variable to your GA4 Measurement ID (e.g. `G-XXXXXXXXXX`). See [CI/CD](cicd.md) for how to set environment variables in GitHub Actions.

## What Gets Tracked

Every `<a>` link rendered by Homebase — link buttons, portfolio cards, social icons, and featured video links — fires a GA event on click with these parameters:

| Parameter | Description | Example values |
|-----------|-------------|----------------|
| `destination` | The link label (what was clicked) | `"YouTube"`, `"GitHub"`, `"course"` |
| `link_type` | The component type | `link_button`, `portfolio_card`, `social_icon`, `featured_video` |
| `section` | Which section it belongs to | `"Top Links"`, `"social_icons"`, `"featured_video"` |

The event name defaults to `creator_link_click`. You can change it in `site.yaml` (see [Configuration](#configuration) below).

## One-Time GA4 Setup

GA4 collects the raw event data automatically, but custom event parameters must be **registered as Custom Dimensions** before they appear in Explorations or Standard Reports.

### Step 1 — Register Custom Dimensions

1. Open [Google Analytics](https://analytics.google.com) → **Admin** (gear icon, bottom left)
2. Under the **Property** column, click **Custom definitions**
3. Click **Create custom dimension** and add all three:

| Display name | Scope | Event parameter |
|---|---|---|
| Link Destination | Event | `destination` |
| Link Type | Event | `link_type` |
| Link Section | Event | `section` |

4. Save each one.

!!! note "24–48 hour delay"
    After registering, allow 24–48 hours for data to start populating in the UI. The events are collected immediately — the delay is only for the dimension values to appear in reports.

### Step 2 — Build a Link Click Exploration

1. Go to **Explore** in the left sidebar
2. Click **Blank** to start a new exploration
3. In the **Variables** panel, click **+** next to **Dimensions** and add:
    - `Event name`
    - `Link Destination` (the custom dimension you registered)
    - `Link Type`
    - `Link Section`
    - `Session default channel group` (or `Session source` for more detail)
4. Click **+** next to **Metrics** and add `Event count`
5. In the **Tab Settings** panel:
    - **Technique**: Free form
    - Drag `Link Destination` into **Rows**
    - Drag `Event count` into **Values**
6. Add a **Filter**: `Event name` exactly matches `creator_link_click`

Example output:

| Destination | Event Count |
|---|---|
| YouTube | 210 |
| GitHub | 175 |
| Blog | 82 |
| Course | 64 |

To add traffic source breakdown, drag `Session default channel group` into **Columns**.

### Step 3 (Optional) — Mark High-Value Links as Conversions

If you want to track newsletter signups, course purchases, or other high-value links as conversions:

1. GA4 → **Admin** → **Events**
2. Find `creator_link_click` in the event list
3. Toggle **Mark as conversion**

Or create a more specific conversion using **Conditions** — for example, only when `destination` equals `"newsletter"`. This requires no code changes; everything is configured inside GA.

## Configuration

### `ga_event_name`

Controls the GA event name sent on every link click. Set this once before deploying — **GA4 cannot rename historical events**, so changing it later starts a new, separate data series in your reports.

```yaml
# site.yaml
ga_event_name: "creator_link_click"  # default
```

Common alternatives: `link_click`, `outbound_click`. Use a value that fits your existing GA naming convention if you already have one.

### `ga_label` (per-link override)

By default, the `destination` parameter uses the link's `title`. If you use seasonal or campaign-specific titles that change over time, add `ga_label` to pin a stable key in GA regardless of how the title changes.

```yaml
sections:
  - title: "Courses"
    links:
      - title: "C# Masterclass (Spring Sale — 80% Off!)"
        url: "https://example.com/course"
        ga_label: "course"   # GA always records "course", not the seasonal title
```

## Looker Studio (Optional)

For a richer visual dashboard, connect GA4 to [Looker Studio](https://lookerstudio.google.com):

1. Looker Studio → **Create** → **Data source**
2. Choose **Google Analytics**, select your property
3. Build charts for: top destinations, top traffic sources, clicks per link type, and conversion rate per source

No changes to Homebase are needed — Looker Studio reads from the same GA4 data.

---

## Shop Analytics

When the shop is enabled, two additional GA4 events are fired automatically.

### `shop_item_click`

Fired when a visitor clicks the CTA button on any shop card.

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `item_id` | string | Stable item identifier (`ga_label` if set, else `id`) | `"csharp-mastery"` |
| `item_title` | string | Item title at the time of click | `"C# .NET Mastery"` |
| `collection_id` | string | Parent collection `id` | `"courses"` |
| `item_type` | string | Item `type` field value | `"course"`, `"ebook"` |
| `item_price` | number | Item price (omitted if price is not set) | `97`, `0` |
| `destination` | string | The destination URL | `"https://…"` |

The event name is configurable via `shop.ga_event_name` in `site.yaml`. Set it once before launch — **GA4 cannot rename historical events**.

### `shop_item_view`

Fired once per item per page visit when a shop card enters the viewport (≥ 50% visible). Powered by `IntersectionObserver`.

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `item_id` | string | Stable item identifier | `"csharp-mastery"` |
| `item_title` | string | Item title | `"C# .NET Mastery"` |
| `collection_id` | string | Parent collection `id` | `"courses"` |
| `item_type` | string | Item `type` field value | `"course"` |

!!! note "Observer not available"
    `shop_item_view` requires `IntersectionObserver`, which is available in all modern browsers. In environments where it is absent the impression event is silently skipped — click tracking is unaffected.

### Register Shop Custom Dimensions

Open **Admin → Custom definitions → Create custom dimension** and add:

| Display name | Scope | Event parameter |
|---|---|---|
| Shop Item ID | Event | `item_id` |
| Shop Item Title | Event | `item_title` |
| Shop Collection ID | Event | `collection_id` |
| Shop Item Type | Event | `item_type` |
| Shop Item Price | Event | `item_price` |

### Build a Shop Exploration

1. **Explore** → **Blank**
2. Add **Dimensions**: `Event name`, `Shop Item Title`, `Shop Collection ID`, `Shop Item Type`
3. Add **Metrics**: `Event count`
4. Filter: `Event name` exactly matches `shop_item_click`
5. Drag `Shop Item Title` into **Rows** and `Event count` into **Values**

To see conversion rate (clicks ÷ views), run two separate explorations — one filtered to `shop_item_click` and one to `shop_item_view` — then compare totals in a spreadsheet or Looker Studio.
