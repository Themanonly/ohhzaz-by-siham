# Reviews and bridal update — 4 October 2026

## Delivered
- Bilingual website review section on the homepage and salon page. Visitors choose 1–5 stars and provide a display name/comment and explicit publication consent.
- Google Maps link is separate. No Google reviews or ratings were scraped, invented or represented as website reviews. No self-serving review rich-result markup was added.
- PostgreSQL submissions start pending. Owner-only moderation can publish, hide, return to pending or delete. Review text/rating cannot be edited by staff. Managers cannot moderate.
- Public response exposes only published reviews (latest 12) and the aggregate of all published website reviews; no fingerprint or unpublished data.
- Same-origin protection, bounded request bodies, server validation, honeypot, duplicate fingerprint and daily submission limits (40 total, 3 per normalized display name). These are basic abuse controls, not identity verification. Visits are labelled unverified.
- Privacy text explains review storage and removal requests.
- Bridal film framing, photographic memory strip, reduced-motion-aware hover details and a three-step preparation journey linking to inspirations and the bridal notebook.

## Database
Applied db/reviews-migration.sql through the existing Railway owner console. The runtime account remains unable to create schema objects. Only DML on the two new review tables was granted. No credentials changed.

## Verification
- npm test, typecheck, production build and 14-route production smoke checks passed.
- scripts/check-reviews.mjs passed actual API/database checks for validation, consent, origin rejection, pending privacy, manager denial, owner publication/hiding/deletion. Temporary staff/review fixtures removed.
- Browser inspection: French/Arabic review section and star selection, bridal film composition and journey. Available browser viewport measured 838px; requested viewport override did not take effect, so a fresh 390px rendering is not claimed.
- Railway UI displayed a trial warning: 10 days or $4.87 remaining. Owner needs a suitable hosting plan before trial expiration.
