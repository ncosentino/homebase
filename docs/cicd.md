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

Edit `.github/workflows/deploy.yml` and change the push target to your own Pages repo:

```yaml
git push --force "https://x-access-token:${GH_DEPLOY_TOKEN}@github.com/YOUR_USERNAME/YOUR_PAGES_REPO.git" HEAD:main
```

### 4. Configure GitHub Pages

In your Pages repo (e.g. `yourname.github.io`):
- Go to Settings → Pages
- Set Source: **Deploy from a branch** → `main` → `/ (root)`

### 5. Custom Domain (Optional)

Edit `src/CNAME` in homebase to contain your custom domain:

```
yourdomain.com
```

Also configure your DNS to point to GitHub Pages (CNAME to `yourname.github.io`).

## Triggering Manually

You can trigger a deploy without pushing by going to Actions → Build and Deploy → Run workflow.
