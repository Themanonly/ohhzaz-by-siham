# OHH ZAZ by SIHAM

French / Arabic RTL salon website. Developed by Naoufal Laamouri.

## Run locally

Use Node.js 22.13+ and npm. Run `npm ci`, then `npm run dev -- --port 3015`.
Open http://127.0.0.1:3015/fr or /ar. Run `npm run typecheck` and `npm run build` before release.

## Content

- Services and confirmed prices: data/services.ts (48 entries from the owner's price sheet).
- Opening hours: components/OpeningHours.tsx. Sunday closed.
- Owner media: public/media. Brand exports: public/brand. Credits: docs/ASSET-CREDITS.md.
- The product page contains explicitly labelled future placeholders only.
- Appointment actions lead to the salon's Instagram contact; the website does not promise booking confirmation or process payments.

## GitHub / Netlify

This repository is proprietary. Use a private GitHub repository. Do not upload node_modules, .next, work, .env files, caches or private asset-audit materials. .gitignore excludes these. No repository or hosting account has been created or modified by this preparation.

1. Push the project to the chosen private GitHub repository.
2. Import it into Netlify. Build command: `npm run build`; publish directory: `.next`; Node: 22. Netlify's current OpenNext integration handles Next.js routes. Do not add a generic SPA redirect or static-export configuration.
3. Configure SITE_URL with the exact final HTTPS origin. Preview URLs can use Netlify's deployment environment automatically.
4. Keep SITE_INDEXABLE=false during review. Only set it to true for the production context after final approval and a fresh deployment.
5. Verify direct loading of /fr/prestations, /ar/mariee and /ar/produits; metadata, social image, video range delivery, 404 status and HTTPS redirects on the actual deployment.

GitHub Actions runs installation, type checks and the production build. Netlify deployment itself has not been tested because no deployment target/account was supplied.

## Launch status

Code is prepared for deployment; publication approval remains separate. See docs/RELEASE-CHECKLIST.md for unresolved content items. No admin, customer accounts, product ordering, payments or analytics are enabled.

## Rights

Copyright 2026 OHH ZAZ by SIHAM and Naoufal Laamouri. All rights reserved for original project work. Third-party assets retain their own licenses; see LICENSE and THIRD_PARTY_NOTICES.md.

Official hosting reference: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
