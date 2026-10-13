-- Apply after schema.sql using the Supabase owner connection, never the web runtime.
BEGIN;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='ohhzaz_runtime') THEN
  CREATE ROLE ohhzaz_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
 END IF;
END $$;
GRANT USAGE ON SCHEMA public TO ohhzaz_runtime;
DO $$
DECLARE app_table text; privileges text;
BEGIN
 FOREACH app_table IN ARRAY ARRAY['salon_staff','salon_sessions','salon_login_limits','product_categories','salon_media','products','social_links','service_groups','salon_reviews','salon_review_limits'] LOOP
  EXECUTE format('REVOKE ALL ON %I FROM PUBLIC,anon,authenticated',app_table);
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',app_table);
  IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=app_table AND policyname='salon_server_only') THEN
   EXECUTE format('CREATE POLICY salon_server_only ON %I TO ohhzaz_runtime USING(true) WITH CHECK(true)',app_table);
  END IF;
  privileges := CASE app_table WHEN 'salon_staff' THEN 'SELECT,UPDATE(password_hash)' WHEN 'salon_media' THEN 'SELECT,INSERT' ELSE 'SELECT,INSERT,UPDATE,DELETE' END;
  EXECUTE format('GRANT %s ON %I TO ohhzaz_runtime',privileges,app_table);
 END LOOP;
END $$;
COMMIT;
