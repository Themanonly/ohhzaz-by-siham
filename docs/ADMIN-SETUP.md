# Admin connection and verification

Status: implemented, NOT connected to a persistent backend and NOT verified with real authenticated roles.

1. In an owner-controlled Supabase project, review and apply supabase/schema.sql once to a new database. The schema is not an idempotent migration; do not run over an existing installation blindly.
2. Disable public signup. Invite the two staff users through Supabase Auth; the user completes their password setup. Assign their exact Auth UUIDs in staff_roles through the trusted SQL dashboard, with admin or manager. Never expose role assignment to the browser.
3. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify and locally as needed. These are public client identifiers; permissions depend on RLS. Never use the service-role key in client code or NEXT_PUBLIC variables.
4. Rebuild after environment changes. /admin uses in-memory sessions; reload requires login again. No password or token is persisted in browser storage by this application. Expired sessions require login again.
5. Test on a nonproduction backend before enabling production editing. Check anonymous cannot write any table or upload; cannot read draft products or staff roles. Ordinary authenticated nonstaff users must have the same write denials.
6. Check manager can create/edit a product, upload JPG/PNG/WebP under 5MB, create/edit a category and save service prices. Manager must be denied contact updates and role assignment through DIRECT API requests, not merely hidden controls.
7. Check admin can edit contact accounts, then add two accounts for each platform and verify public chooser identities and exact WhatsApp message forwarding. Restore the intended real accounts afterward.
8. Publish a test product, reload a fresh public session and verify persistence, search/filter/detail/price. Unpublish and ensure anonymous API and public UI no longer expose it. Remove test data through normal owner-approved tools.
9. Service groups use the five established IDs and default to the owner price sheet until saved. New tariff entries use their category image. Product descriptions and Arabic translations are optional in the editor; supply good Arabic translations before launch.
10. Storage is a public catalogue bucket containing only public product photography. Uploads use random immutable paths; no UI overwrite/delete policy. Clean orphan files only through trusted administration after checking references.

The public catalogue validates response shape and safe image/contact URLs. Backend outages show labelled catalogue previews and suppress contact links rather than display potentially obsolete configured numbers. Monitor this condition operationally.

Not included: payment, stock reservation, orders, customer accounts, arbitrary page editing, staff invitation UI, or guaranteed booking availability. Do not advertise those capabilities.

References: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/storage/security/access-control
