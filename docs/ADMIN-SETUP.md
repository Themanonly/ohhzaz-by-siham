# Railway administration setup

The website stays on Netlify; PostgreSQL stays in the existing OHH ZAZ by SIHAM Railway project. Do not provision another website service or Supabase project.

## Connection and migration
DATABASE_URL is server-only, saved as a Netlify production secret. Previews do not receive it. Local .env.local is ignored by Git.
lib/database-options.mjs enforces TLS and verifies the certificate with db/certs/railway-root.crt and postgres.railway.internal. This is a PUBLIC CA certificate, not a private key. Never disable certificate verification to work around renewal errors. next.config.ts traces this certificate into the server bundle.
db/schema.sql is active; supabase/schema.sql is historical and must not be applied.
Migration command: node --env-file=.env.local scripts/migrate.mjs. The schema and seed data are already present: four categories, five service groups, three contacts.

## Private staff setup
Owner: sihamhallaoui1@gmail.com. Manager email is still required.
The owner runs this from the project PowerShell terminal:
```powershell
.\scripts\setup-staff.ps1 -Email 'sihamhallaoui1@gmail.com' -Role admin
```
It requests a masked password of at least 14 characters and never overwrites an existing account. Do not send passwords through chat or put them in command arguments. Repeat with the approved separate manager email and -Role manager.

Sessions use hashed random tokens and HttpOnly/Secure/SameSite cookies lasting eight hours. Manager can edit products, categories and service prices. Admin also edits contact links. There is no public signup, role-assignment API, or arbitrary visual page editor.
Uploads are public product photographs, not private documents.

## Checks and deployment
Run npm run check and node --env-file=.env.local scripts/check-database.mjs.
The database check starts a production server on port 3031, creates temporary test identities/category, checks TLS, authentication, CSRF, secure cookies, role enforcement, persistence and logout, then removes its own test records. Global login throttling counts these test requests.
VS Code must deploy the current source and verify real hosted login, upload, publication and persistence. Local success does not prove that Netlify is running this code.
See RAILWAY-HANDOFF.md for outstanding security and account steps.
Payments, orders, stock reservation and automatic appointment confirmation are not implemented.
