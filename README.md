# OHH ZAZ by SIHAM

French / Arabic RTL salon website. Developed by Naoufal Laamouri.

## Local development
Node.js 22.13+; `npm ci`, then `npm run dev -- --port 3028`.
Checks: `node scripts/check-content.mjs`, `npm run check`, `node scripts/check-production.mjs`.

## Content and features
- 27 services from the owner’s Tarifs.pdf in data/services.ts; prices in MAD.
- Sunday closed; Monday–Wednesday 09:30–19:30; Thursday–Saturday 09:30–20:00.
- Full-width, uncropped mobile homepage film; portrait bridal film with couple-poster, custom controls and supporting photographs.
- Bridal date/time, services and inspiration form generates identical copy/WhatsApp messages. This is an enquiry, not a confirmed reservation.
- Searchable/filterable product catalogue. Until real products are published, explicitly labelled previews have no invented prices or checkout.
- Instagram, TikTok and WhatsApp; multiple accounts open a chooser. Source credits are in docs/ASSET-CREDITS.md.

## Admin
/admin is implemented for Supabase Auth, database and storage. Without configuration it shows setup information. No backend or staff accounts have been provisioned or tested against a live service.
Full admin manages products, categories, services and contact accounts. Manager manages products, categories and services. This is a content administration panel, not a visual page/layout editor.
Read docs/ADMIN-SETUP.md before enabling it. Never expose a service-role key.

## Deployment
Deployment is assigned to the user’s VS Code agent. Follow docs/VS-CODE-DEPLOYMENT-PROMPT.md.
Current origin: https://ohhzaz-by-siham.netlify.app. Future ohhzaz.com must not become canonical until purchased, connected and HTTPS-ready.
Production Netlify context enables indexing; preview contexts disable it. Changing SITE_URL or indexing settings requires a rebuild because sitemap/robots are generated at build time.
Use the Next.js integration, not a generic SPA redirect or static export.

## Rights
Copyright 2026 OHH ZAZ by SIHAM and Naoufal Laamouri. Original project work is proprietary. Third-party assets retain their own licenses. See LICENSE, THIRD_PARTY_NOTICES.md and docs/ASSET-CREDITS.md.
