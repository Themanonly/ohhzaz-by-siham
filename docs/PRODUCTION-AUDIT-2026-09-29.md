# Production finishing review — 29 September 2026

## Scope and decisions
Reviewed the tracked application, API/data/authentication paths, routing/metadata, styles, tests, configuration, operational documents and deployed media inventory. Dependencies and generated build/cache files were checked with tooling rather than manually described as line-by-line reviewed. All edits stayed within this project. Original owner assets were not modified.

French and Arabic remain the only public languages. There are no English/Darija routes or false hreflang declarations. Existing natural Moroccan wording is retained; metadata cannot guarantee ranking for languages without corresponding content.

## Corrections
- Unified footer implementation and styles: address, directions, navigation, social accounts, privacy and ownership now have distinct responsive groups. Corrected Arabic developer-credit alignment.
- Fixed light-card text contrast in the salon visit panel and readable panorama captions; numbered salon detail photographs sequentially.
- Separated desktop hero playback controls from the small service label. Kept the mobile widescreen video and portrait bridal composition.
- Fixed initial tariff deep links after filtering changes page height. Verified the selected category and section survive a language change. Browser automation that scrolls a sticky link before clicking can alter the starting position; direct visible-control verification confirmed the actual preservation behavior.
- Replaced the misspelled social-sharing card with an original editable SVG and 1200 × 630 JPEG bearing OHH ZAZ.
- Added bilingual privacy/content-rights information, truthful service OfferCatalog data, localized Casablanca titles and a 14-URL sitemap with reciprocal alternates.
- Centralized business identity/address/map details using the owner's supplied Maps listing.
- Unified build-time indexing/origin configuration. Explicit indexing opt-out is respected; previews stay noindex; runtime metadata and generated sitemap/robots use the same decision.
- Strengthened product-image and service-data validation; nonexistent uploaded images are rejected. Malformed password hashes with trailing segments are rejected. Restricted-browser storage failures no longer break navigation.
- Enabled strict TypeScript, added indexing/content/security regression checks, HSTS and API noindex headers.

## Cleanup
Removed obsolete source-rewriting scripts, the unused historical Supabase schema, unused CSS selector branches and 13 unreferenced deployed media derivatives. Kept responsive image sizes, real gallery media and all required thumbnails. Old operational snapshots are explicitly marked historical; DEPLOYMENT.md is current. No exact duplicate tracked file contents were found in the initial inventory. No suspected plaintext connection credentials or private keys were found in the reviewed tracked/unignored source scan; this is not a claim that every possible secret format has been detected.

## Verification evidence
- Production compilation and strict type checking passed.
- Content checks passed for 27 owner-authoritative prices, service images and contact/message encoding.
- Indexing matrix passed for explicit opt-in/out, preview contexts and canonical normalization; preview build smoke checks covered all 14 routes.
- Production smoke checks cover 14 localized pages, one H1 each, canonical/social metadata, robots/sitemap, 38 media URLs, real 404 responses, verification HTML, admin noindex and video range responses.
- Railway integration passed: verified TLS, legacy password upgrade and repeat login, anonymous/CSRF rejection, secure session cookies, admin/manager permissions, persistent writes, unpublished-media privacy, publication/unpublication and logout. Temporary fixtures were cleaned up.
- Runtime database role was observed without superuser, create-role or create-database privileges; one permanent admin exists. Manager creation remains intentionally deferred.
- Production dependency audit reported zero known vulnerabilities at review time.
- Real browser review covered public page layouts in French and Arabic at 390px mobile and 1440px desktop, shared footer/header and the authenticated admin. Focused interactions included product search/detail/Escape, bridal play/pause and identical copy/WhatsApp text, FAQ expansion, tariff filtering and language preservation. No enquiry was sent and no real admin content was changed for browser testing.

## Release verification
The release commit and published Netlify result must be confirmed after pushing. Use the existing ohhzaz-by-siham project and https://ohhzaz.com. Repeat live smoke/security checks; local results alone are not deployment evidence.

## Honest limits
This is a salon information/enquiry site with content administration. Future products remain labelled previews; there is no payment processing, order fulfilment or automatic booking. Security testing is not a guarantee against all attacks. Database backup availability/restoration and owner media permissions must not be claimed from application tests alone. Copyright notices reserve original rights and preserve third-party licenses; they do not constitute formal registration. Search Console submission and technical SEO do not guarantee indexing or ranking.

Reference: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites and https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
