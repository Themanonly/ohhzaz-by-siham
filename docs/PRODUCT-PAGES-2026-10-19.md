# Product pages and galleries — 19 October 2026

Every published product has stable French and Arabic URLs:
`/fr/produits/<product-id>` and `/ar/produits/<product-id>`.
Renaming a product does not change its address. Drafts and unknown IDs return 404.

Catalogue cards navigate to the individual page. The admin list includes “Voir le produit”; on the public page, “Copier le lien du produit” copies its clean address for advertisements. The WhatsApp order includes that product address. Tracking query parameters do not change canonical URLs.

The responsive gallery displays uncropped photos with thumbnails, previous/next controls, horizontal touch swipe, keyboard arrows, fullscreen viewing and 2× zoom. Fullscreen closes with Escape or its close button and restores focus/scroll. Arabic controls respect reading direction.

Each page renders product-specific title, description, social images, canonical/alternate links and Product structured data. Published product URLs are included in the sitemap, refreshed every 60 seconds and invalidated with catalogue edits. No stock or shipping promises are invented. Existing photos and product records are unchanged; no database migration is required.

Validation: typecheck, full existing test suite, gallery interaction tests, production build, and scripts/check-product-pages.mjs (French/Arabic public products, ad query parameters, metadata, sitemap, WhatsApp, unknown IDs). Browser QA covers desktop, 390px mobile and Arabic, photo navigation and fullscreen.
