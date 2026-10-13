# Supabase migration, 13 October 2026

Target: OHH ZAZ by SIHAM, project `zseepsrowgidprvfddjd`, Europe (London). Netlify hosts https://ohhzaz.com. The Supabase Data API is disabled; database access is server-only.

## Verified transfer

The root-password pooler connection repeatedly returned 28P01, including bounded retries after the owner reset. No TLS protection was weakened. The authenticated Supabase SQL editor provided a working owner connection. A transaction transferred all ten application tables and validated counts/checksums before commit. The first attempt rolled back on a microsecond timestamp difference; the corrected transfer preserved PostgreSQL timestamps as strings rather than truncated JavaScript Dates.

Staff, sessions, login limits, product categories, products, media, social links, service groups, reviews and review limits were copied. IDs, prices, translations, timestamps, salted password hashes and uploaded image bytes were retained. A fresh source/target comparison after technical tests used SHA-256 over sorted canonical database rows for every table. See SUPABASE-MIGRATION-RESULT.json. The source was unchanged. No passwords or private record contents are in that report.

The transfer created a separate NOLOGIN runtime role with minimal grants and RLS on all ten tables. The owner privately activated it in the existing SQL editor. Its credential was subsequently replaced after a browser observation included the entered connection value; rejection of the old credential and verified TLS with the replacement were both checked. No plaintext passwords or database URLs are committed.

The public pooler terminates TLS. Client encryption is therefore verified on the Node TLS transport with certificate and hostname validation, rather than incorrectly treating pg_stat_ssl on the provider's internal hop as client encryption evidence.

## Runtime and release

- Local .env.local and Netlify's secret production DATABASE_URL use the restricted Supabase transaction pooler on port 6543. DATABASE_PROVIDER is supabase. Production credentials are absent from previews and agent runners.
- Runtime cannot create schemas/tables/roles, change staff roles or insert staff accounts. Anonymous/authenticated Data API roles have no application-table privileges. Existing salon login and Admin/Manager permissions remain server-side; no duplicate Supabase Auth users were invented.
- Runtime accepts Supabase endpoints only. The old provider's certificate and runtime branch were removed. One-time transfer helpers were retired; schema.sql, supabase-security.sql and the private owner activation template document provisioning.
- Before Netlify release, isolated Supabase technical tests exercised session authorization, CSRF, product edits, image variants/ETags, immediate draft privacy, published-product deletion rejection, draft deletion and logout. Temporary products/categories/sessions were removed; the complete source/target comparison then passed again.
- The result report records whether production cutover has been verified. Do not equate saved settings with a published deploy. Original cloud source retirement is a separate irreversible action; it is kept temporarily for recovery without website dependence.

## Performance and preview behavior

Only validated public catalogue data is cached, for 60 seconds. Admin edits expire it immediately. Private admin/session data is never cached. Every image request checks current publication/session authorization before returning a cached variant or 304. Draft bytes do not reach shared CDN caches. Photos have bounded 320/640/960/1600-pixel WebP variants, uncropped previews and enlarged-photo mode with a persistent WhatsApp order action.

The mobile salon film retains the complete aspect ratio and costs approximately 48% fewer bytes. Automatic playback respects reduced motion, data saving and slow connections. Explicit playback remains available.

Cloudflare stays DNS-only while Netlify provides the CDN. Blanket proxy caching of HTML, /admin or /api is not a speed fix. Sources: https://supabase.com/docs/guides/database/connecting-to-postgres and https://answers.netlify.com/t/support-guide-what-problems-could-occur-when-using-cloudflare-in-front-of-netlify/138/1 .
