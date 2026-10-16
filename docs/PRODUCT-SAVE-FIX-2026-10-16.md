# Product creation repair — 16 October 2026

## Evidence and scope

The reported symptom was a Create product click with no visible response. A live,
authenticated diagnostic successfully uploaded a new PNG, inserted a draft through
the API and confirmed it in Supabase. A second authenticated list request also
returned a created draft. Runtime INSERT permissions are present. Existing salon
products and staff accounts were not changed; diagnostic products and short-lived
diagnostic sessions were removed. One tiny, unlinked diagnostic image remains
private because the runtime deliberately has no media DELETE permission.

The exact original input/browser could not be reproduced: the browser connector
failed to initialize. Do not claim a rendered browser verification for this release.

Confirmed code defects addressed:
- Native invalid fields prevented the submit handler without application feedback.
- Save/upload failures were reported above the form, away from the submit button.
- The submit button had no saving label and missing categories silently disabled it.
- A failed list refresh after a successful insert was reported as a failed save.
- Requests depended on AbortSignal.timeout, which is absent in older mobile browsers.
- The previous 5 MiB upload allowance exceeded Netlify's effective binary request
  limit (approximately 4.5 MB; https://docs.netlify.com/build/functions/configuration/).

## Changes

The form now validates fields explicitly, focuses the first invalid field, displays
progress/errors/success next to its submit button, preserves failed input, accepts
decimal commas, and clearly distinguishes drafts from published products. It guards
against repeated submission and reuses a successfully uploaded photo on save retry.
A confirmed saved record is immediately reconciled into the list, even if refreshing
the rest of the catalogue fails.

Photos up to 20 MiB are decoded locally, capped at 40 million pixels, resized without
cropping to at most 1600 pixels and encoded below 2 MiB before upload. Server-side
image decoding, bounds, re-encoding and authentication remain enforced. Requests
use AbortController with a timer instead of AbortSignal.timeout. Raw server errors,
credentials and database details are not shown to users.

Added DOM-based regression coverage using the real React form with mocked transport
and image encoding. It covers validation, upload/save failure, retained inputs,
decimal prices, retry reuse, list-refresh failure after commit, reload, publishing,
duplicate-submit protection and older-browser transport. This is not screenshot QA.

Dependency audit fixes update the locked Next.js version to 16.4.2, sharp to 0.35.5,
and source-map-js to a patched release. Development tests require Node 22.22.2+ on
the 22 LTS line, 24.15+ on the 24 LTS line, or Node 26+.

## Validation before publication

- `npm test`: passed, including the new `test:admin` suite.
- `npm run build`: passed with production origin and indexing configuration.
- Production-server smoke checks: all 14 French/Arabic routes, 40 media URLs,
  verification file, robots, 404 handling, admin noindex and video ranges passed.
- `npm audit`: zero reported vulnerabilities.

Publication and post-deploy verification are recorded separately after completion.
