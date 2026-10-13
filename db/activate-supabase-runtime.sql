-- OWNER HANDOFF: the owner runs this query and copies the returned password privately.
-- The credential is generated on the database; no actual password is saved in this query.
CREATE OR REPLACE FUNCTION pg_temp.activate_salon_runtime() RETURNS text
LANGUAGE plpgsql AS $$
DECLARE private_password text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='ohhzaz_runtime' AND NOT rolcanlogin) THEN
  RAISE EXCEPTION 'Runtime is missing or already activated. Do not reset it by rerunning this query.';
 END IF;
 private_password := replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
 EXECUTE format('ALTER ROLE ohhzaz_runtime LOGIN PASSWORD %L',private_password);
 RETURN private_password;
END $$;
SELECT pg_temp.activate_salon_runtime() AS private_runtime_password;
