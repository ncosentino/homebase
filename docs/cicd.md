---
description: Set up Cloudflare Pages to build and deploy your Homebase landing page automatically. Includes API token setup, custom domain, analytics, and scheduled rebuilds.
---

# CI/CD Setup

The deploy workflow builds the site and, when deployment is enabled, uploads it directly to Cloudflare Pages using Wrangler.

## How It Works

1. You push to `main` in your repository generated from the Homebase template
2. GitHub Actions runs `.github/workflows/deploy.yml`
3. It installs dependencies and builds the site with Eleventy
4. When `HOMEBASE_DEPLOY_ENABLED` is `true`, it uploads `_site/` to Cloudflare Pages
5. Same-repository pull requests receive separate preview deployments when deployment is enabled

## Setup Steps

### 1. Create a Cloudflare Pages project

This must exist once before the first upload. Either use the dashboard (**Workers & Pages →
Create → Pages → Connect to Git**, then disconnect Git afterward since deploys come from this
workflow instead) or run this once from your machine:

```sh
npx wrangler pages project create your-project-name --production-branch main
```

Then set `name` in `wrangler.toml` to match the project name you chose.

### 2. Create an API Token

1. Cloudflare dashboard → **My Profile → API Tokens → Create Token → Custom token**
2. Grant **Account → Cloudflare Pages → Edit**
3. Copy the token

### 3. Find your Account ID

Cloudflare dashboard → **Workers & Pages** — your account ID is shown in the right-hand sidebar.

### 4. Add Repository Secrets

In your generated repository, go to **Settings → Secrets and variables → Actions**, and add:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | The token from step 2 |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID from step 3 |

Repository secrets and variables are not copied from the Homebase template, so each generated repository must configure its own deployment credentials.

### 5. Enable Deployment

Under **Settings → Secrets and variables → Actions → Variables**, add:

| Variable | Value |
|----------|-------|
| `HOMEBASE_DEPLOY_ENABLED` | `true` |

Without this variable, pushes and pull requests still build successfully, but Cloudflare deployment steps are skipped and the scheduled rebuild job does not run.

### 6. Custom Domain (Optional)

Set `seo.cname` in `_data/site.yaml` — this only generates a reference `CNAME` file; the actual
domain is attached in Cloudflare, not GitHub:

```yaml
seo:
  cname: "links.yourdomain.com"
```

Then, in the Cloudflare dashboard: your Pages project → **Custom domains → Set up a custom
domain**. If the domain's DNS already lives on Cloudflare, the record and free TLS certificate
are provisioned automatically. Leave `seo.cname` blank to use the default
`your-project-name.pages.dev` URL.

### 7. Analytics (Optional)

To enable Google Analytics 4:

1. In your generated repository, go to **Settings → Secrets and variables → Actions**
2. Add a secret named `GOOGLE_ANALYTICS_ID` with your `G-XXXXXXXXXX` measurement ID

!!! note
    Leave the secret unset to disable analytics entirely. The ID is never stored in the repo.

## Triggering Manually

You can trigger a deploy without pushing by going to **Actions → Build and Deploy → Run workflow**.

## Documentation Deployment

The workflow always builds the bundled Homebase documentation, but it only publishes that site when the `HOMEBASE_DOCS_PROJECT_NAME` repository variable contains a Cloudflare Pages project name. Generated repositories should normally leave this variable unset.

## Scheduled Rebuilds

When deployment is enabled, `scheduled-rebuild.yml` automatically rebuilds the site daily at
8am UTC. This keeps time-sensitive content fresh -- notably the YouTube channel feed, which
fetches the latest video at build time.

**To change the frequency**, edit the `cron` expression in `.github/workflows/scheduled-rebuild.yml`:

| Cron expression | Frequency |
|-----------------|-----------|
| `0 */6 * * *` | Every 6 hours |
| `0 8 * * *` | Once daily at 8am UTC |
| `0 8 * * 1` | Once weekly, Monday 8am UTC |

**To disable scheduled rebuilds**, delete `.github/workflows/scheduled-rebuild.yml`.

!!! warning
    GitHub automatically disables scheduled workflows in repos with no activity (pushes, PRs, etc.) for 60 days. If this happens, re-enable it via the Actions tab.

## Limits (Cloudflare free plan)

- Unlimited requests and bandwidth
- Direct-upload deployments (what this workflow does) do not count toward Cloudflare's monthly build quota
- 100 custom domains per project; up to 20,000 files per deployment; 25 MiB per file
