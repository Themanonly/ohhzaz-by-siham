# Release checklist

Use DEPLOYMENT.md for current operations and PRODUCTION-AUDIT-2026-09-29.md for review evidence.

- Run source, content, indexing, password and origin checks.
- Build explicitly for the owned production domain and verify all 14 localized routes, canonical links, sitemap alternates, robots, media and 404 responses.
- Verify database TLS, staff role boundaries, session handling, upload/publication rules and fixture cleanup with the database test script.
- Inspect shared header/footer, public page layouts, interactions and admin in the real browser at desktop/mobile sizes, including Arabic RTL.
- Review the final diff and confirm no secrets or local exports enter Git.
- Push to the existing production branch, then confirm the published Netlify commit and repeat live smoke/security checks.
- Preserve Google verification records and sitemap submission. Report indexing separately from deployment.

Owner follow-up: supply genuine product inventory when ready; create a separate manager account only when requested; review business wording and media permissions. Backups and restoration must be verified in Railway before claiming disaster recovery readiness. Appointments remain enquiries; payments and automatic booking are not implemented.
