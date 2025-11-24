# CI/CD Basics: A Practical Guide

This document explains Continuous Integration and Continuous Deployment—what they are, why they matter, and how you'll use them with GitHub to safely update your deployed applications.

---

## The Problem CI/CD Solves

Without CI/CD, updating a live application looks like this:

1. You make changes locally
2. You manually test them (maybe)
3. You run build commands
4. You deploy directly to production
5. You hope nothing breaks

This is risky. You might forget to test. You might deploy broken code. You might overwrite something important. And if something goes wrong, your users see it immediately.

**CI/CD automates the safety checks and deployment process**, so you can confidently push updates without manually babysitting every step.

---

## The Two Parts: CI and CD

### Continuous Integration (CI)

**What it means**: Every time you push code to GitHub, automated checks run to verify your code works.

**What it does**:
- Runs your test suite (if you have one)
- Checks for TypeScript/linting errors
- Attempts to build your application
- Reports pass/fail status on your pull request

**The key insight**: CI catches problems *before* they reach your live application. If the build fails or tests fail, you know immediately—not after deployment.

### Continuous Deployment (CD)

**What it means**: When code passes all checks and reaches your main branch, it automatically deploys to your live environment.

**What it does**:
- Builds your application for production
- Pushes it to your hosting platform (Fly.io, Cloudflare Pages, etc.)
- Only happens after CI passes

**The key insight**: You never manually run deploy commands. Merging to main *is* deploying.

---

## How It Works with GitHub

GitHub provides **GitHub Actions**—a built-in automation system that runs tasks in response to events (like pushing code or opening a pull request).

### The Workflow File

You define what should happen in a YAML file stored in your repository:

```
your-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml    ← This file defines your CI/CD pipeline
├── src/
└── ...
```

### A Mental Model

Think of it as a recipe that GitHub follows:

```
WHEN: someone pushes to main branch
DO:
  1. Set up a fresh computer with Node.js
  2. Install project dependencies
  3. Run the build command
  4. If build succeeds, deploy to Fly.io
```

GitHub provides the computers (called "runners") for free. You just write the instructions.

---

## Essential Vocabulary

| Term | Meaning |
|------|---------|
| **Workflow** | A complete automation recipe (the YAML file) |
| **Job** | A group of steps that run on the same machine |
| **Step** | A single task within a job (like "run npm install") |
| **Runner** | The virtual machine GitHub provides to run your workflow |
| **Trigger** | The event that starts a workflow (push, pull request, etc.) |
| **Secret** | Sensitive values (API keys, tokens) stored securely in GitHub |
| **Artifact** | Files produced by a workflow (like build output) |
| **Pipeline** | The complete flow from code push to deployment |

---

## The Workflow You'll Use

For your Fly.io deployment, the pipeline will look like this:

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Push to main ──► Install deps ──► Build ──► Deploy to Fly.io │
│                                                                 │
│   Push to other    Install deps     Build     (stop here,      │
│   branches    ──►              ──►       ──►   no deploy)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Translation**:
- Push to `main` → full pipeline including deployment
- Push to feature branches → build check only (verify it works, but don't deploy)

---

## Your Development Flow with CI/CD

Once set up, here's how you'll work on your app:

### 1. Create a Branch for Your Changes

```bash
git checkout -b feature/improve-dashboard
```

### 2. Make Your Changes Locally

Edit files, test locally with `npm run dev`, iterate until happy.

### 3. Push Your Branch

```bash
git add .
git commit -m "Improve dashboard layout"
git push -u origin feature/improve-dashboard
```

### 4. Open a Pull Request

On GitHub, create a PR from your branch to `main`. GitHub Actions automatically runs your CI checks.

### 5. Wait for Checks to Pass

You'll see status indicators on the PR:
- ✓ Green check = build succeeded
- ✗ Red X = something failed (click to see what)

### 6. Merge When Ready

Once checks pass and you're satisfied, merge the PR. This triggers deployment automatically.

### 7. Your Live App Updates

Within a few minutes, your changes are live on Fly.io. No manual deployment needed.

---

## What This Means for Your Live App

**Your deployed app stays stable** because:

1. **You never deploy untested code** — CI catches build errors before they reach production
2. **You can experiment safely** — feature branches don't affect the live app
3. **Rollback is easy** — if something slips through, revert the merge and the previous version deploys
4. **You have a clear history** — every deployment corresponds to a merge, visible in git history

---

## Secrets and Security

Your deployment needs credentials (like your Fly.io API token). These should **never** be in your code.

GitHub Secrets let you store sensitive values securely:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add secrets (like `FLY_API_TOKEN`)
3. Reference them in your workflow: `${{ secrets.FLY_API_TOKEN }}`

The values are encrypted and hidden from logs.

---

## Adapting to Different Platforms

The CI part (install, build, test) is the same everywhere. Only the CD part changes based on where you're deploying:

| Platform | CD Approach |
|----------|-------------|
| **Fly.io** | Use `flyctl deploy` command with API token |
| **Cloudflare Pages** | Connect repo directly; Cloudflare handles deployment |
| **VPS** | SSH into server and pull/restart, or use Docker |
| **Hostinger Shared** | FTP/SFTP upload, or git pull on server |

You'll create different workflow files (or conditional steps) for different deployment targets.

---

## What We'll Set Up for act-hub

For this project, we'll create a workflow that:

1. **On any push**: Runs `npm install` and `npm run build` to verify the code works
2. **On push to main**: Additionally deploys to Fly.io using their official GitHub Action

This gives you:
- Confidence that PRs won't break the build
- Automatic deployment when you merge to main
- Zero manual deployment steps

---

## Next Steps

When you're ready to implement:

1. We'll create the `.github/workflows/deploy.yml` file
2. You'll add your Fly.io API token to GitHub Secrets
3. We'll test it with a small change
4. You'll have working CI/CD

---

## Quick Reference

**To update your live app**:
```bash
git checkout -b my-change      # Create branch
# ... make changes ...
git add . && git commit -m "Description"
git push -u origin my-change   # Push branch
# Open PR on GitHub, wait for checks, merge
# App deploys automatically
```

**To check deployment status**:
- Go to your repo → Actions tab
- See all workflow runs and their status

**If deployment fails**:
- Click the failed run to see logs
- Fix the issue, push again
- The workflow re-runs automatically
