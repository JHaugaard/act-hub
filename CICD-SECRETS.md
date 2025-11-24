# CI/CD Secrets Configuration

This document lists the secrets required for the CI/CD pipelines.

## GitHub Actions Secrets

Add these secrets in your repository settings:
**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `FLY_API_TOKEN` | Fly.io deploy token | See setup instructions below |

## Fly.io Setup Instructions

### 1. Install Fly CLI (if not already installed)

```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Authenticate with Fly.io

```bash
flyctl auth login
```

### 3. Create a Deploy Token

```bash
flyctl tokens create deploy -x 999999h
```

This creates a long-lived deploy token. Copy the output — it starts with `FlyV1...`

### 4. Add Token to GitHub

1. Go to your repository on GitHub
2. Click **Settings** (tab at the top)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `FLY_API_TOKEN`
6. Value: Paste the token from step 3
7. Click **Add secret**

## Verification

After adding the secret, verify the pipeline works:

```bash
git add .
git commit -m "ci: add CI/CD pipeline"
git push
```

Then check the **Actions** tab in your GitHub repository to watch the workflow run.

## Troubleshooting

### "FLY_API_TOKEN not set"
- Verify the secret name is exactly `FLY_API_TOKEN` (case-sensitive)
- Check the secret is added to the correct repository

### "App not found"
- Ensure `fly.toml` and `fly.pocketbase.toml` exist in your repo
- Verify the app names in those files match your Fly.io apps

### "Permission denied"
- The token may have expired or been revoked
- Generate a new token with `flyctl tokens create deploy -x 999999h`

## Security Notes

- Never commit tokens to your repository
- Deploy tokens are scoped to deployment only (cannot modify billing, delete apps, etc.)
- Rotate tokens periodically by creating a new one and updating the GitHub secret
