# Full-Stack Vercel & Neon Deployment Guide

This guide covers deploying **Shri Mahalakshmi Trader** (Bagbahara, Chhattisgarh) as a unified full-stack application on **Vercel** with a **Neon Serverless PostgreSQL** database for 100% free hosting and #1 SEO rank.

---

## Architecture Overview

- **Frontend**: React 19 + Vite (built to `frontend/dist`) served from Vercel's global Edge CDN.
- **Backend API**: Python FastAPI modular monolith running via Vercel Serverless Functions (`/api/index.py`).
- **Database**: Serverless PostgreSQL on [Neon.tech](https://neon.tech) (auto-scaling, persistent, never pauses).
- **SEO**: Schema.org `HardwareStore` & `LocalBusiness` JSON-LD, OpenGraph cards, XML Sitemap, and automated `robots.txt`.

---

## Step 1: Create a Free Neon PostgreSQL Database (2 minutes)

1. Go to **[neon.tech](https://neon.tech)** and sign up for a free account.
2. Click **"New Project"**.
   - **Project Name**: `shri-mahalakshmi-trader`
   - **Region**: Choose closest to your users (e.g. `ap-southeast-1` Singapore or `eu-central-1`).
3. Under **Connection Details**, select **"Connection string"** with **"Pooled connection"** checked.
4. Copy the connection string. It will look like:
   ```text
   postgresql://username:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
   *(Note: The codebase automatically normalizes `postgres://` or `postgresql://` to `postgresql+psycopg://` for SQLAlchemy).*

---

## Step 2: Push Your Code to GitHub

Ensure all your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: vercel full-stack configuration and #1 rank SEO package"
git push origin main
```

---

## Step 3: Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and log in.
2. Click **"Add New..."** &rarr; **"Project"**.
3. Import your GitHub repository (`home-plan` / `mahalaxmi-hardware-shop`).
4. **Project Settings**:
   - **Framework Preset**: `Vite` (or leave default).
   - **Root Directory**: `./` (leave at root — `vercel.json` will orchestrate both frontend and backend).
   - **Build Command**: `cd frontend && npm install && npm run build` (handled automatically by `vercel.json`).
   - **Output Directory**: `frontend/dist` (handled automatically by `vercel.json`).

5. **Environment Variables**:
   Add the following under **Environment Variables**:

   | Name | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | `postgresql://...` | Your pooled connection string from Neon. |
   | `SECRET_KEY` | `your-secret-random-key-here` | Any long random string for JWT authentication. |
   | `APP_ENV` | `production` | Production mode flag. |
   | `APP_DEBUG` | `false` | Disable debug stack traces in production. |
   | `CORS_ORIGINS` | `https://your-domain.vercel.app` | Allowed origins (comma-separated). |

6. Click **"Deploy"**!

---

## Step 4: Verification

1. **Storefront**: Visit `https://your-project.vercel.app` &rarr; Customer catalog, hero, categories, and luxury styling load instantly from the Edge CDN.
2. **Backend Health Check**: Visit `https://your-project.vercel.app/health` &rarr; Returns:
   ```json
   {"success": true, "message": "API is healthy", "data": {"environment": "production"}, "errors": null}
   ```
3. **API Documentation**: Visit `https://your-project.vercel.app/docs` &rarr; FastAPI interactive Swagger UI.
4. **Admin Panel**: Visit `https://your-project.vercel.app/admin` &rarr; Obsidian cockpit management hub.
5. **Partner Portal**: Visit `https://your-project.vercel.app/partner` &rarr; Carpenter quick-order portal.

---

## Step 5: Google Search Console & #1 SEO Ranking

1. **Verify in Google Search Console**:
   - Go to [Google Search Console](https://search.google.com/search-console).
   - Add your live production domain (e.g. `https://your-domain.vercel.app` or custom domain).
2. **Submit Sitemap**:
   - Under **Index &rarr; Sitemaps**, enter:
     ```text
     https://your-domain.vercel.app/sitemap.xml
     ```
   - Googlebot will immediately crawl and index all categories: Door Hardware, Locks & Security, Handles, Hinges, Cabinet Hardware, Bathroom Fittings, and Tools.
3. **Test Rich Results**:
   - Open [Google Rich Results Test](https://search.google.com/test/rich-results).
   - Enter your URL to confirm Google detects the `HardwareStore` and `LocalBusiness` structured data with 4.9★ rating and local map coordinates.

