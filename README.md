# Shoplytics — E-Commerce Sales Analytics & Management Platform

A full-stack-feeling, portfolio-ready analytics dashboard built with React, Vite, Tailwind CSS, and Recharts. Runs entirely in the browser — all data (accounts, orders, products, customers) is stored in `localStorage`, so there's no backend to configure and it deploys as a static site.

## Features

- Landing page, auth flow (sign up / log in / forgot & reset password), protected dashboard
- Overview, Sales, Customer, and Product analytics — all KPIs and charts computed live from the dataset
- Orders management, Inventory tracking with low-stock alerts, automated Insights engine
- CSV data import (with validation + preview) and CSV export
- Global search, notifications, dark/light mode, fully responsive layout
- One-click realistic demo data (1,450+ orders, 180 customers, 25 products)

## Getting started locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Building for production

```bash
npm run build
npm run preview   # optional: preview the production build locally
```

The static site is output to `dist/`.

## Deploying to GitHub Pages

You have two options — pick one.

### Option A: GitHub Actions (recommended, fully automatic)

This repo already includes `.github/workflows/deploy.yml`, which builds and deploys the site automatically every time you push to `main`.

1. Push this project to a new GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push (or re-push) to `main` — the workflow will build and publish the site.
5. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

No extra configuration is needed — `vite.config.js` uses a relative base path (`./`) so it works under any repository name automatically.

### Option B: `gh-pages` package (manual deploy from your machine)

```bash
npm install
npm run build
npm run deploy
```

This publishes the contents of `dist/` to a `gh-pages` branch using the `gh-pages` npm package (already listed in `devDependencies`). Then in **Settings → Pages**, set the source to the `gh-pages` branch.

## Project structure

```
shoplytics/
├── .github/workflows/deploy.yml   # GitHub Actions Pages deployment
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                    # entire application (routing, auth, data layer, all pages)
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Tailwind entry stylesheet
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── .gitignore
```

## Data & "backend"

Everything the app needs is in `src/App.jsx`, in a section marked `PERSISTENT STORAGE LAYER`. It wraps the browser's `localStorage` behind three small async functions (`storeGet`, `storeSet`, `storeDelete`), so:

- Data persists across page reloads on the same browser/device.
- Data is **not** shared across devices or browsers (there's no server).
- Clearing browser storage/site data will remove all accounts and data.

If you later want a real multi-device backend, swap the implementations of those three functions for calls to Supabase (or any other backend) — nothing else in the app needs to change, since every page reads/writes through that same layer.

## Tech stack

- React 18 + Vite 5
- Tailwind CSS 3
- Recharts (charts)
- lucide-react (icons)
