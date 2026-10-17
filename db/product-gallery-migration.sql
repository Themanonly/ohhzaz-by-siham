-- Run once in the Supabase SQL editor as the database owner, before deployment.
-- Existing photos and products are preserved. No runtime privilege changes.
BEGIN;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[];
UPDATE public.products SET images=ARRAY[image] WHERE images IS NULL;
ALTER TABLE public.products ALTER COLUMN images SET NOT NULL;
-- Maintain compatibility with already-open, single-photo admin clients.
CREATE OR REPLACE FUNCTION public.normalize_product_images() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.images IS NULL THEN NEW.images:=ARRAY[NEW.image]; END IF;
 IF TG_OP='UPDATE' AND NEW.image IS DISTINCT FROM OLD.image AND NEW.images IS NOT DISTINCT FROM OLD.images THEN
  NEW.images:=ARRAY[NEW.image];
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.normalize_product_images() FROM PUBLIC;
DROP TRIGGER IF EXISTS normalize_product_images ON public.products;
CREATE TRIGGER normalize_product_images BEFORE INSERT OR UPDATE ON public.products
 FOR EACH ROW EXECUTE FUNCTION public.normalize_product_images();
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_images_valid;
ALTER TABLE public.products ADD CONSTRAINT products_images_valid CHECK (
 cardinality(images) BETWEEN 1 AND 8 AND array_ndims(images)=1
 AND array_lower(images,1)=1 AND array_position(images,NULL) IS NULL AND images[1]=image
);
CREATE INDEX IF NOT EXISTS products_published_gallery ON public.products USING gin(images) WHERE status='published';
COMMIT;
