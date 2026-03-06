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
| `src/assets/` | Base CSS and lite-youtube.js |
| `src/themes/` | Theme CSS files |
| `src/icons/` | SVG brand icon files |
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
