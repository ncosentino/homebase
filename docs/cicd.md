# CI/CD Setup

The deploy workflow builds the site and pushes the output to your GitHub Pages repository.

## How It Works

1. You push to `main` in your forked `homebase` repo
2. GitHub Actions runs `.github/workflows/deploy.yml`
3. It installs deps, builds the site with 11ty, and force-pushes `_site/` to your Pages repo

## Setup Steps

### 1. Create a GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click **Generate new token**
3. Set **Repository access** → Only select repositories → choose your Pages repo (e.g. `yourname/yourname.github.io`)
4. Under **Permissions → Repository permissions**, set **Contents** to **Read and write**
5. Generate and copy the token

### 2. Add the Token as a Secret

1. In your `homebase` fork, go to Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `GH_DEPLOY_TOKEN`
4. Value: paste the token from step 1

### 3. Update the Workflow

Edit `.github/workflows/deploy.yml` and change `DEPLOY_REPO` at the top to your own Pages repo:

```yaml
env:
  DEPLOY_REPO: youruser/youruser.github.io
```

### 4. Configure GitHub Pages

In your Pages repo (e.g. `yourname.github.io`):

- Go to Settings → Pages
- Set Source: **Deploy from a branch** → `main` → `/ (root)`

### 5. Custom Domain (Optional)

Set `seo.cname` in `_data/site.yaml` to your custom domain:

```yaml
seo:
  cname: "links.yourdomain.com"
```

Leave it blank (or remove the field) to use the default `yourname.github.io` URL.
Also configure your DNS to point to GitHub Pages (CNAME to `yourname.github.io`).

### 6. Analytics (Optional)

To enable Google Analytics 4:

1. In your `homebase` fork, go to Settings → Secrets and variables → Actions
2. Add a secret named `GOOGLE_ANALYTICS_ID` with your `G-XXXXXXXXXX` measurement ID

!!! note
    Leave the secret unset to disable analytics entirely. The ID is never stored in the repo.

## Triggering Manually

You can trigger a deploy without pushing by going to **Actions → Build and Deploy → Run workflow**.

## Scheduled Rebuilds

`scheduled-rebuild.yml` automatically rebuilds the site daily at 8am UTC. This keeps
time-sensitive content fresh -- notably the YouTube channel feed, which fetches the latest
video at build time.

**To change the frequency**, edit the `cron` expression in `.github/workflows/scheduled-rebuild.yml`:

| Cron expression | Frequency |
|-----------------|-----------|
| `0 */6 * * *` | Every 6 hours |
| `0 8 * * *` | Once daily at 8am UTC |
| `0 8 * * 1` | Once weekly, Monday 8am UTC |

**To disable scheduled rebuilds**, delete `.github/workflows/scheduled-rebuild.yml`.

!!! warning
    GitHub automatically disables scheduled workflows in repos with no activity (pushes, PRs, etc.) for 60 days. If this happens, re-enable it via the Actions tab.

