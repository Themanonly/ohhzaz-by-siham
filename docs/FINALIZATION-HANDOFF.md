# Finalization handoff — 28 September 2026

Changes are local. The VS Code deployment agent is responsible for Git and Netlify publication.

## Security changes

- Production scripts use a fresh CSP nonce per document, without unsafe-inline or unsafe-eval for scripts. Inline CSS remains allowed for existing layout behavior. Pages carrying nonces are private/no-store.
- Mutation origins are checked against SITE_URL; arbitrary Host headers are not accepted as an origin allowlist. Loopback access is limited to matching local ports.
- Password verification is asynchronous. New hashes use versioned scrypt with N=32768, r=8, p=3 and random salt. Existing hashes remain readable and are upgraded on a successful login. No password reset is needed.
- Password and session-token plaintext is not stored in PostgreSQL. Authentication necessarily retains staff email, salted password hash, role, session-token hashes and expiry. Business catalogue content and uploaded media remain in the database.
- Draft/unattached media now requires an active staff session. Published product images remain public. Responses use no-store so unpublishing does not leave newly cached copies; files previously downloaded cannot be recalled.
- Admin roles are explicitly validated. Existing secure, HttpOnly, SameSite=strict cookies, parameterized SQL and database certificate verification remain enabled.
- Admin session loading is explicit; expired sessions return to login. Logout only reports success after server revocation succeeds.

This is application hardening, not a claim of absolute security. Railway disk/backup encryption, provider access, retention and recovery configuration have not been verified in this pass. Existing staff email and catalogue fields are not individually encrypted by the application. A public database endpoint still requires credentials and verified TLS. Do not remove legitimate database records to meet a literal “no data stored” interpretation.

## Presentation changes

- Admin overview counts, consistent SVG icons, responsive navigation, product photo preview, useful empty states and collapsible tariff categories.
- Product search/filter controls, colored category preview surfaces, clearer detail dialogs and accessible interaction states. Product placeholders remain explicitly identified as future items.
- Homepage video keeps its widescreen mobile frame and gains fullscreen controls where supported, refined calls to action and restrained entrance motion. Reduced-motion preferences are respected.
- The new finishing layer is app/finishing.css, imported after release.css. Include it in the deployment.

## Verification

- Production build including TypeScript passed after the final password change.
- check-security.mjs passed legacy/current password verification, origin allowlist, fresh CSP nonces, anonymous API rejection, CSRF rejection and media denial.
- check-database.mjs passed Railway TLS, legacy-hash upgrade, repeat login, roles, upload visibility, published/unpublished image access and logout. It creates temporary fixtures and deletes those exact fixtures in finally; never print their credentials.
- check-content.mjs passed 27 prices, thumbnails, contact URL safety and catalogue validation.
- smoke-check.mjs passed all 12 French/Arabic routes, 38 assets, video range support, 404, preview robots and verification file.
- Earlier tracked-source scan found no PostgreSQL credential URLs, private keys or GitHub tokens among the scanned patterns. This was not a full historical secret audit. Production dependency audit reported no known vulnerabilities at the time of the check.
- Browser review covered desktop/mobile dashboard, hero and product presentation. Local admin login and reload were verified with the owner's session. Final product search and dialog interactions were rechecked on mobile.
- The final Arabic product-page language transition and the authenticated admin tariff disclosure controls were verified in the local browser. A stray empty admin status indicator was removed.

## VS Code deployment instructions

1. Work only in this repository. Review git status/diff, including untracked finishing.css, request-security.ts and check-security.mjs. Preserve unrelated changes; stage only reviewed source/docs/tests. Never stage .env.local, secrets, build artifacts or temporary files.
2. Use existing authenticated browser tabs only. Reload the relevant tab before checking a deployment, except when it contains unsaved input. Do not open new login sessions or expose credentials.
3. Run npm.cmd run typecheck, npm.cmd run build, node scripts/check-content.mjs, node scripts/check-security.mjs and git diff --check. Use a freshly started production preview to run smoke-check.mjs and check-security.mjs with its URL. The database integration test was already run against the configured database; do not repeat its mutations unnecessarily.
4. Confirm production SITE_URL is https://ohhzaz-by-siham.netlify.app and DATABASE_URL is server-only. Production secrets must not be exposed to deploy previews. No schema migration is required for this patch.
5. Commit the reviewed finalization patch and push the existing deployment branch. Deploy the existing Netlify project ohhzaz-by-siham. Do not create a new site. Record commit and deployment identifiers.
6. Reload the existing production tab after Netlify reports success. Check /fr, /ar, /fr/produits, /ar/produits and /admin. Confirm scripts hydrate under CSP, videos/play/fullscreen work where supported, filters/dialogs respond, and the owner session survives reload. No real content edits are needed for this check.
7. Verify production response headers, secure cookies without printing them, anonymous admin denial, sitemap.xml and robots.txt. Compare production sitemap with SITE_INDEXABLE=true expectations; do not use preview assertions unchanged. Keep admin and API routes unindexed.
8. Report what passed and any actual remaining issue. Confirm Railway encryption-at-rest/backups and account access settings separately before claiming those infrastructure controls are verified.
9. When ohhzaz.com is purchased and connected later, update SITE_URL, confirm domain/TLS/redirects, rebuild, then verify canonical URLs, language alternates and sitemap on that domain. Do not switch it before the domain works.

Rollback note: once a staff member logs in after this release, their hash may use scrypt-v2. Any rollback must retain the version-aware verifier in lib/password.ts; older code that only understands salt:hash will not authenticate upgraded accounts. Do not restore weaker hashes or reset passwords as part of a routine UI rollback.
