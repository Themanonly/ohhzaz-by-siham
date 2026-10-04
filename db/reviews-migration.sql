BEGIN;
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
GRANT SELECT,INSERT,UPDATE,DELETE ON salon_reviews,salon_review_limits TO ohhzaz_runtime;
COMMIT;
