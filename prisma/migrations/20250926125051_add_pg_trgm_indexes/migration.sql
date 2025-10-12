-- This is an empty migration.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Title & Slug (langsung di Product)
CREATE INDEX IF NOT EXISTS idx_product_title_trgm 
  ON "Product" USING gin (lower(title) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_product_slug_trgm 
  ON "Product" USING gin (lower(slug) gin_trgm_ops);

-- Category & Sub_category (relasi, berarti index di tabel Category dan SubCategory)
CREATE INDEX IF NOT EXISTS idx_category_name_trgm 
  ON "Category" USING gin (lower(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_category_slug_trgm 
  ON "Category" USING gin (lower(slug) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_sub_category_name_trgm 
  ON "SubCategory" USING gin (lower(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_sub_category_slug_trgm 
  ON "SubCategory" USING gin (lower(slug) gin_trgm_ops);
