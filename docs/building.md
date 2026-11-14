---
description: Run Homebase locally with the Eleventy dev server for live-reload previews. Covers npm install, dev server, production build, and project structure.
---

# Local Development

Run homebase locally to preview your changes before pushing.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

## Install Dependencies

```bash
npm install
```

## Dev Server

Start the Eleventy dev server with live reload:

```bash
npm start
```

The site is served at [http://localhost:8080](http://localhost:8080). Changes to `_data/site.yaml` or any source file automatically rebuild and reload the browser.

## Production Build

Build the static output to `_site/`:

```bash
npm run build
```

The `_site/` directory contains everything needed to deploy -- plain HTML, CSS, and assets.

## Cleaning the Output

Remove the `_site/` directory:

```bash
npm run clean
```

## Project Structure

| Path | Purpose |
|------|---------|
| `_data/site.yaml` | All content and configuration |
| `src/index.njk` | Main page template (Nunjucks) |
| `src/_includes/` | Shared Nunjucks partials |
| `src/_includes/integrations/` | Optional widget partials (FAQ, etc.) |
| `src/assets/` | Base CSS and lite-youtube.js |
| `src/themes/` | Theme CSS files |
| `src/icons/` | SVG brand icon files |
| `src/llms.txt.njk` | Auto-generated `/llms.txt` interoperability summary |
| `src/llms-full.txt.njk` | Auto-generated `/llms-full.txt` full-text companion |
| `src/robots.txt.njk` | Auto-generated `/robots.txt` |
| `.eleventy.js` | Eleventy configuration |
| `_site/` | Build output (gitignored) |

## Adding a New Icon

1. Add an SVG file to `src/icons/` -- name it `myicon.svg`
2. Reference it in `site.yaml` with `icon: myicon`
3. Eleventy will inline the SVG at build time

## Adding a New Theme

See [Themes](themes.md) for the full guide on creating and applying custom themes.

## Contributing

Pull requests are welcome. Please keep changes minimal and focused on a single concern per PR.

## Documentation-site descriptions

MkDocs derives descriptions from each page's title and introductory prose, excluding
notes, navigation, images, code blocks and tables. Missing prose receives a truthful
site/page identity fallback; the homepage retains its project description.
Existing nonempty `description:` frontmatter takes precedence, but no new handwritten
descriptions are required. Maintain the ordinary documentation source instead.

Generated summaries target 240 characters at word boundaries; explicit descriptions
are not truncated. Invalid non-string descriptions fail the build. HTML and social
rendering escape values while source metadata remains plain text for JSON-LD and
`llms.txt`. Hosted documentation validation exercises the real templates and preserves
headings and content. No runtime AI or separate metadata authoring is involved.
This policy applies to the documentation site, not the landing-page SEO configuration.
