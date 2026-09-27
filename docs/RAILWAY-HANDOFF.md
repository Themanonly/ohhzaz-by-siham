# Railway continuation — 27 September 2026

## Verified
- Railway project 956fe93a-20c1-4feb-ac38-55bc534f3e67; Postgres service e98c397e-a344-4849-9c29-b6a7b1568280 online.
- Schema and seeds verified: four categories, five service groups, three contacts, zero permanent staff accounts.
- Netlify DATABASE_URL saved as a secret for production only; a new deploy is needed to activate it.
- Local connection verified with TLS 1.3 and certificate validation.
- Production build and database integration checks passed: anonymous denial, CSRF rejection, secure session cookies, Admin/Manager separation, persistent category creation, staff-table isolation and logout. Temporary records were removed.
- Inspected live Netlify commit: 164bad6. New backend code is local and not deployed.

## VS Code deployment
Preserve/review the diff. Include app/api, lib/database-options.mjs and db/certs/railway-root.crt. Never include .env.local or private keys. Follow ADMIN-SETUP.md. Confirm the public certificate is bundled. After deployment, /api/admin/auth/session must return 401 without a session, not 404/503/500. Verify actual hosted login and product upload/publish/unpublish with owner-approved accounts before declaring administration ready.

## Required before production staff access
- Owner privately chooses the password for sihamhallaoui1@gmail.com; separate Manager email/password are still needed.
- An administrative database password appeared in a tool diagnostic during inspection of Railway's raw editor. Rotate it privately, update Netlify's production DATABASE_URL and local .env.local, then redeploy. Never reproduce that diagnostic or put the secret in Git.
- Replace the initial database-owner connection with a dedicated runtime role restricted to application table operations; keep schema/staff provisioning credentials separate.
- Railway currently has a limited trial (17 days / approximately $5). Arrange a continuing plan and backup policy.

Website hosting remains Netlify. The coding agent did not push or deploy.
