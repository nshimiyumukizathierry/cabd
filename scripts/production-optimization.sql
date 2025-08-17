-- Production Optimization Script for CarBD Platform
-- Run this before deploying to production

-- 1. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON public.cars(make, model);
CREATE INDEX IF NOT EXISTS idx_cars_price ON public.cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON public.cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_stock ON public.cars(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON public.cars(created_at);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_car_id ON public.cart_items(car_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_car_id ON public.favorites(car_id);

CREATE INDEX IF NOT EXISTS idx_founders_display_order ON public.founders(display_order);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Add helpful views for common queries
CREATE OR REPLACE VIEW public.cars_with_stock AS
SELECT * FROM public.cars WHERE stock_quantity > 0;

CREATE OR REPLACE VIEW public.featured_cars AS
SELECT * FROM public.cars 
WHERE stock_quantity > 0 AND image_url IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 6;

CREATE OR REPLACE VIEW public.car_stats AS
SELECT 
  COUNT(*) as total_cars,
  COUNT(*) FILTER (WHERE stock_quantity > 0) as in_stock,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') as with_images,
  AVG(price) as average_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM public.cars;

-- 3. Create function for search functionality
CREATE OR REPLACE FUNCTION public.search_cars(search_term TEXT)
RETURNS TABLE (
  id UUID,
  make TEXT,
  model TEXT,
  year INTEGER,
  price DECIMAL,
  stock_quantity INTEGER,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.make,
    c.model,
    c.year,
    c.price,
    c.stock_quantity,
    c.image_url,
    c.description,
    c.created_at,
    c.updated_at,
    (
      CASE 
        WHEN LOWER(c.make) = LOWER(search_term) THEN 1.0
        WHEN LOWER(c.model) = LOWER(search_term) THEN 1.0
        WHEN LOWER(c.make) LIKE LOWER('%' || search_term || '%') THEN 0.8
        WHEN LOWER(c.model) LIKE LOWER('%' || search_term || '%') THEN 0.8
        WHEN LOWER(c.description) LIKE LOWER('%' || search_term || '%') THEN 0.6
        ELSE 0.0
      END
    ) as relevance
  FROM public.cars c
  WHERE 
    LOWER(c.make) LIKE LOWER('%' || search_term || '%') OR
    LOWER(c.model) LIKE LOWER('%' || search_term || '%') OR
    LOWER(c.description) LIKE LOWER('%' || search_term || '%') OR
    c.year::TEXT LIKE '%' || search_term || '%'
  ORDER BY relevance DESC, c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Add audit triggers for important tables
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, operation, record_id, new_data, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(NEW), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, operation, record_id, old_data, new_data, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, operation, record_id, old_data, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD), NOW());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add audit triggers (optional - only if you want detailed logging)
-- DROP TRIGGER IF EXISTS audit_cars ON public.cars;
-- CREATE TRIGGER audit_cars AFTER INSERT OR UPDATE OR DELETE ON public.cars
--   FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 5. Optimize storage policies for production
-- Ensure storage bucket is properly configured
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'cars';

-- 6. Create backup and maintenance functions
CREATE OR REPLACE FUNCTION public.cleanup_old_cart_items()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete cart items older than 30 days
  DELETE FROM public.cart_items 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Performance monitoring view
CREATE OR REPLACE VIEW public.performance_stats AS
SELECT 
  'cars' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.cars')) as table_size
FROM public.cars
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.profiles')) as table_size
FROM public.profiles
UNION ALL
SELECT 
  'founders' as table_name,
  COUNT(*) as row_count,
  pg_size_pretty(pg_total_relation_size('public.founders')) as table_size
FROM public.founders;

-- 8. Final verification and stats
SELECT 
  'Production Optimization Complete!' as status,
  (SELECT COUNT(*) FROM public.cars) as total_cars,
  (SELECT COUNT(*) FROM public.founders) as total_founders,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'cars') as storage_buckets;

-- Show performance stats
SELECT * FROM public.performance_stats;

-- Show car statistics
SELECT * FROM public.car_stats;
