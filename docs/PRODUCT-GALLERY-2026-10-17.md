# Product gallery release — 17 October 2026

Products support 1–8 photos, with the first as the cover. Staff can select several files, add more, reorder and remove photos before saving. Each upload is optimized and retained for retries. Public product dialogs offer accessible French/Arabic thumbnails, selection count and zoom, preserving uncropped artwork.

The additive Supabase migration `db/product-gallery-migration.sql` was applied through the signed-in owner SQL editor. Its result confirmed all four existing products and covers preserved. Runtime permissions were not expanded. Existing single-image clients remain compatible; updates omitting `images` preserve the gallery unless the legacy cover changes.

All gallery URLs are validated against uploaded media. Unpublished or detached images remain private. Catalogue invalidation applies to gallery edits. Idempotent creation avoids duplicate products after response loss; reconnecting retains unsaved form/photo state.

Validation: production build and typecheck; indexing/content/security suites; admin DOM tests covering photo add/reorder/remove/save/retry; public gallery selection/zoom/reset tests in French and Arabic; authenticated local server with production Supabase private fixtures proving two real JPEG uploads, persistence/reordering/removal, invalid galleries rejected, legacy updates, privacy and deletion. Existing products preserved. Temporary test products and sessions removed; small test media remain private because runtime has no media-delete privilege.

Deploy only after the schema migration. Do not roll back the schema to deploy older code: its trigger preserves single-photo compatibility. No credentials included in this release.
