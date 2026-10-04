BEGIN;
CREATE TABLE IF NOT EXISTS salon_staff(id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL, role text NOT NULL CHECK(role IN ('admin','manager')), active boolean NOT NULL DEFAULT true);
CREATE TABLE IF NOT EXISTS salon_sessions(token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES salon_staff(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS salon_login_limits(key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, reset_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS product_categories(id text PRIMARY KEY, name jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS products(id text PRIMARY KEY, category_id text NOT NULL REFERENCES product_categories(id), name jsonb NOT NULL, description jsonb, price numeric(10,2) NOT NULL CHECK(price>=0), image text NOT NULL, status text NOT NULL CHECK(status IN ('draft','published')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS social_links(id text PRIMARY KEY, platform text NOT NULL CHECK(platform IN ('instagram','tiktok','whatsapp')), url text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS service_groups(id text PRIMARY KEY, fr text NOT NULL, ar text NOT NULL, items jsonb NOT NULL CHECK(jsonb_typeof(items)='array'), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS salon_media(id uuid PRIMARY KEY, bytes bytea NOT NULL, content_type text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS salon_sessions_expiry ON salon_sessions(expires_at);
CREATE TABLE IF NOT EXISTS salon_reviews (
 id uuid PRIMARY KEY, name text NOT NULL CHECK(char_length(name) BETWEEN 2 AND 60),
 rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5),
 comment text NOT NULL CHECK(char_length(comment) BETWEEN 20 AND 1500),
 locale text NOT NULL CHECK(locale IN ('fr','ar')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','hidden')),
 fingerprint text UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS salon_reviews_public ON salon_reviews(status,created_at DESC);
CREATE TABLE IF NOT EXISTS salon_review_limits(key text PRIMARY KEY, attempts integer NOT NULL, reset_at timestamptz NOT NULL);
COMMIT;
