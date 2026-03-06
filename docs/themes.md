---
description: Three built-in themes for your Homebase landing page, plus a guide to creating your own theme with CSS custom properties.
---

# Themes

homebase ships with 3 built-in themes. Set `theme:` in `_data/site.yaml` to switch.

## Built-in Themes

| Theme | Description |
|-------|-------------|
| `devleader` | Dark gradient (#1E2330 → #7F8B99), white border buttons -- the default |
| `minimal` | Clean white/light background, dark text |
| `neon` | Dark background with vibrant purple accent (#b47aff) |

## Creating a Custom Theme

1. Create a folder: `src/themes/mytheme/`
2. Create `src/themes/mytheme/theme.css`
3. Set `theme: mytheme` in `_data/site.yaml`

### Theme CSS Variables

Override any of these custom properties in your `theme.css`:

```css
:root {
  /* Background */
  --bg-from: #1E2330;        /* gradient start (or solid if --bg-to matches) */
  --bg-to: #7F8B99;          /* gradient end */

  /* Typography */
  --font-family: Inter, sans-serif;
  --name-color: #ffffff;
  --bio-color: rgba(255, 255, 255, 0.8);
  --section-header-color: rgba(255, 255, 255, 0.6);

  /* Avatar */
  --avatar-size: 96px;
  --avatar-border: 3px solid rgba(255, 255, 255, 0.3);

  /* Link Buttons */
  --btn-bg: transparent;
  --btn-border: #ffffff;
  --btn-text: #ffffff;
  --btn-hover-bg: #ffffff;
  --btn-hover-text: #1E2330;
  --btn-radius: 30px;
  --btn-font-size: 0.95rem;
}
```

You only need to override the variables you want to change.

!!! tip "Minimal custom theme"
    Start by overriding just `--bg-from`, `--bg-to`, and `--btn-border` to get a distinct look with very little code.

