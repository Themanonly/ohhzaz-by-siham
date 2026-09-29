# Deployment and operations

Production: https://ohhzaz.com. Existing Netlify project: ohhzaz-by-siham. Cloudflare supplies DNS; Railway supplies PostgreSQL. Do not create replacement projects or move credentials into source control.

## Release
1. Review the source diff and preserve unrelated work. Run `npm ci`, `npm test`, and `npm run typecheck`.
2. Build with `SITE_URL=https://ohhzaz.com`, `SITE_INDEXABLE=true`, `CONTEXT=production`. Run `node scripts/check-production.mjs`. Run `node --env-file=.env.local scripts/check-database.mjs` only in the authorized database test workflow; it creates and removes its own fixtures.
3. Check that secrets, local exports and generated work files are ignored. Commit the reviewed source and push to the existing production branch. Use the existing Netlify Next.js integration; never add a catch-all SPA redirect or static export.
4. Confirm the published Netlify deploy corresponds to that commit. Check public pages, admin/API protection, media ranges, canonical URLs, robots and sitemap using the included scripts against https://ohhzaz.com.
5. Use only already-open authenticated browser tabs for hosted settings. Reload before inspecting status; preserve unsaved form input. Verify mobile/desktop rendering and the authenticated dashboard without changing real catalogue data.

## Configuration
- `DATABASE_URL` is a server-only production secret, not a browser variable. Preview deployments must not receive production credentials.
- `SITE_URL` and `SITE_INDEXABLE` are public build configuration, deliberately embedded to keep runtime metadata consistent with generated robots/sitemap. An explicit false is respected. Non-production Netlify contexts cannot index.
- Changing canonical/indexing configuration requires a new build. Existing www and Netlify-host aliases redirect to the owned domain; preserve paths and query parameters.
- Keep Cloudflare website records DNS-only while Netlify terminates HTTPS. A Cloudflare proxy recommendation alone is not an outage or a reason to change the established network configuration.

## Search and rights
The sitemap contains the seven public routes in French and Arabic (14 URLs), with correct reciprocal alternates. No English/Darija versions or invented alternate-language pages are declared. Search engines decide indexing and ranking; passing checks does not guarantee either. Do not repeatedly request indexing after a Search Console quota error.

LICENSE covers original work by OHH ZAZ by SIHAM and Naoufal Laamouri; third-party materials retain their licenses. These notices are not a government copyright or trademark registration. Publication permissions for supplied client media remain the owner's responsibility.

## Recovery and maintenance
Use a previous successful Netlify deploy to roll back application code. Do not roll back database content by applying an old schema. Verify Railway backup availability and restoration procedures in the account before relying on a recovery claim; source control is not a database backup. Keep credentials private, rotate them through provider controls if compromised, and update dependent server secrets together. Database certificate verification must remain enabled.

Orders, online payments and automatic appointment confirmation are not implemented. Product previews are explicitly labelled; publish only genuine inventory through the admin.
