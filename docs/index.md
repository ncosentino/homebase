# Homebase

A fully config-driven, SEO-optimized linktree-style landing page powered by [Eleventy (11ty)](https://www.11ty.dev/). Fork it, edit one YAML file, and have a personal landing page deployed automatically via GitHub Actions.

**[Live demo →](https://github.devleader.ca)**

## Features

| Feature | Description |
|---------|-------------|
| 🚀 Blazing fast | Static HTML -- no JavaScript required for the page itself |
| 🎨 Themeable | 3 built-in themes (`devleader`, `minimal`, `neon`), or create your own |
| 📱 Responsive | Mobile-first layout |
| 🔍 SEO-optimized | title, meta description, canonical, Open Graph, Twitter Card, JSON-LD Schema.org |
| 🤖 AEO/GEO-optimized | `llms.txt` for AI answer engines (Perplexity, ChatGPT Browse, etc.) |
| 🎬 YouTube embed | Lite-YouTube thumbnail → iframe (zero performance cost until clicked) |
| 📄 sitemap.xml + robots.txt | Auto-generated from your config |
| 🔒 No secrets in repo | Deploy token stored only as a GitHub Actions secret |

## Quick Start

1. **Fork this repo** on GitHub
2. **Edit `_data/site.yaml`** -- change your profile, links, theme, and SEO fields
3. **Set up the deploy token** -- see [CI/CD](cicd.md) for instructions
4. **Push to `main`** -- GitHub Actions builds and deploys automatically

That's it. No code changes needed.

## Project Structure

```
homebase/
├── _data/
│   └── site.yaml          ← All personalization lives here
├── src/
│   ├── index.njk          ← Main page template
│   ├── llms.txt.njk       ← AI/LLM crawler file
│   ├── robots.txt.njk     ← Search engine crawler file
│   ├── sitemap.xml.njk    ← Sitemap
│   ├── _includes/         ← Nunjucks partials
│   ├── assets/            ← Base CSS + lite-youtube.js
│   ├── themes/            ← Theme CSS files
│   └── icons/             ← SVG brand icons
├── .eleventy.js           ← 11ty configuration
├── package.json
└── .github/workflows/
    ├── deploy.yml              ← CI/CD (builds + pushes to Pages repo)
    └── scheduled-rebuild.yml  ← Periodic rebuild (keeps YouTube feed fresh)
```

## Why It Exists

Most linktree alternatives are either paid SaaS products, or generic tools that don't support developer-focused features like `llms.txt`, structured data, or custom domains without friction. Homebase is a free, open-source template designed for developers who want full control over their landing page with zero runtime dependencies.

## About

Built and maintained by [Nick Cosentino](https://www.devleader.ca) -- Principal Engineering Manager at Microsoft and content creator focused on C#, .NET, and software engineering.
