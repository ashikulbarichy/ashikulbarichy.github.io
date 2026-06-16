# Vercel & Sanity Deployment Guide

This guide outlines the steps to deploy your Vite React frontend and your Sanity Studio to production.

---

## 1. Prerequisites & Repository Setup

Ensure your local changes are committed and pushed to a Git repository (GitHub, GitLab, or Bitbucket).
Vercel integrates directly with your Git provider to enable automatic deployments on every `git push`.

---

## 2. Deploying the Frontend (Vite) on Vercel

The frontend code resides in the subdirectory `portfolio/project`. Follow these steps to deploy it:

1. **Log in to Vercel**: Go to [vercel.com](https://vercel.com) and log in.
2. **Import Project**: Click **Add New** > **Project** and select your Git repository.
3. **Configure Settings**:
   * **Project Name**: Set a name for your portfolio.
   * **Framework Preset**: Select **Vite** (Vercel should auto-detect this).
   * **Root Directory**: Click **Edit** next to Root Directory and select `portfolio/project`.
4. **Environment Variables**:
   Expand the **Environment Variables** section and add the following keys with their values from your local `.env` file:
   * `VITE_SANITY_PROJECT_ID` = `eu7fw3iy`
   * `VITE_SANITY_DATASET` = `production`
   * `VITE_SANITY_API_VERSION` = `2023-05-03`
   * `VITE_SANITY_API_TOKEN` = `your_actual_token_here`
5. **Deploy**: Click the **Deploy** button.

---

## 3. Deploying Sanity Studio

To manage your content in production, you need to deploy your Sanity Studio. You have two options:

### Option A: Deploy to Sanity's Hosted Service (Recommended)
Sanity offers a free, high-performance global CDN for hosting the Studio. This is the simplest option.

1. Open your terminal and navigate to the Sanity folder:
   ```bash
   cd Sanity/portfolio
   ```
2. Run the deployment command:
   ```bash
   npx sanity deploy
   ```
3. Enter your preferred hostname when prompted (e.g., `yourname-portfolio.sanity.studio`).
4. Once completed, your Studio will be live at `https://yourname-portfolio.sanity.studio`.

---

### Option B: Deploy Sanity Studio to Vercel
If you want to keep all hosting on Vercel, you can deploy the Studio as a separate Vercel project:

1. In Vercel, click **Add New** > **Project** and import the same repository.
2. **Project Name**: e.g., `portfolio-sanity-studio`.
3. **Framework Preset**: Select **Other**.
4. **Root Directory**: Edit and set this to `Sanity/portfolio`.
5. **Build and Output Settings**:
   * Build Command: `npm run build` (or `sanity build`)
   * Output Directory: `dist`
6. Click **Deploy**.

---

## 4. CRITICAL: Configure CORS Origins in Sanity

By default, Sanity blocks requests from unauthorized domains. You **must** allow your frontend's Vercel URL to read your Sanity dataset.

### Option A: Via the Command Line
1. Open your terminal in the `Sanity/portfolio` directory.
2. Run:
   ```bash
   npx sanity cors add https://your-portfolio-site.vercel.app --credentials
   ```

### Option B: Via the Sanity Management Dashboard
1. Go to the [Sanity Manage Console](https://www.sanity.io/manage).
2. Select your project: **`eu7fw3iy`** (Portfolio).
3. Navigate to **API** > **CORS origins**.
4. Click **Add CORS origin**.
5. Enter your Vercel URL (e.g., `https://your-portfolio-site.vercel.app`).
6. Check **Allow credentials** and save.

---

## 5. Post-Deployment Verification

After completing these steps, verify:
1. Your frontend website loads properly at your Vercel URL.
2. Content (projects, landing page info) is fetched correctly from Sanity (and not using mock fallbacks).
3. You can log into your deployed Sanity Studio and publish changes.
