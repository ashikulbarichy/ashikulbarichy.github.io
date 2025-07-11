# GitHub Pages Deployment Guide

## Prerequisites
- Your repository is named: `ashikulbarichy.github.io`
- Vite config is already set up with correct base path

## Deployment Steps

### 1. Build the project
```bash
npm run build
```

### 2. Deploy to GitHub Pages
```bash
# If using GitHub Actions (recommended)
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# Or manually copy dist folder to gh-pages branch
```

### 3. Configure GitHub Pages
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions" (recommended) or "Deploy from a branch"
4. If using branch deployment, select `gh-pages` branch and `/` folder

## Favicon Setup ✅
- Favicon file: `public/favicon.ico` (15KB)
- HTML references: Properly configured in `index.html`
- Paths: Using absolute paths (`/favicon.ico`) for GitHub Pages compatibility

## Important Notes
- The `base: '/ashikulbarichy.github.io/'` in `vite.config.ts` ensures proper asset paths
- All assets in `public/` folder are automatically copied to the root of the built site
- Favicon will be available at: `https://ashikulbarichy.github.io/favicon.ico`

## Testing
After deployment, verify:
1. Site loads at: `https://ashikulbarichy.github.io/`
2. Favicon appears in browser tab
3. All assets load correctly
4. Navigation works properly

## Troubleshooting
- If favicon doesn't appear, clear browser cache
- Ensure repository name matches the base path in vite.config.ts
- Check that favicon.ico is in the public folder 