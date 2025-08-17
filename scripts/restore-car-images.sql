-- Restore car images with proper references to the cars bucket
-- This script updates existing cars with proper image paths

-- First, let's check if we have any cars
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cars') THEN
        RAISE NOTICE 'Cars table does not exist. Please run database setup first.';
        RETURN;
    END IF;
END $$;

-- Update cars with proper image paths
UPDATE cars SET 
  image_url = 'TESLA.jpg',
  updated_at = NOW()
WHERE make = 'Tesla' AND model LIKE '%Model S%';

UPDATE cars SET 
  image_url = 'BMW.jpg',
  updated_at = NOW()
WHERE make = 'BMW' AND (model LIKE '%M3%' OR model LIKE '%3 Series%');

UPDATE cars SET 
  image_url = 'CORORA.jpg',
  updated_at = NOW()
WHERE make = 'Mercedes-Benz' OR make = 'Mercedes' AND model LIKE '%C-Class%';

UPDATE cars SET 
  image_url = 'AUDI.jpg',
  updated_at = NOW()
WHERE make = 'Audi' AND model LIKE '%A4%';

UPDATE cars SET 
  image_url = 'POCHE.jpg',
  updated_at = NOW()
WHERE make = 'Porsche' AND model LIKE '%911%';

UPDATE cars SET 
  image_url = 'FERARI.jpg',
  updated_at = NOW()
WHERE make = 'Ferrari' AND model LIKE '%F8%';

-- Insert demo cars if no cars exist
INSERT INTO cars (id, make, model, year, price, stock_quantity, image_url, description, created_at, updated_at)
SELECT 
  'demo-tesla-1',
  'Tesla',
  'Model S',
  2023,
  89990,
  5,
  'TESLA.jpg',
  'Electric luxury sedan with autopilot capabilities and premium interior',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE make = 'Tesla' AND model = 'Model S');

INSERT INTO cars (id, make, model, year, price, stock_quantity, image_url, description, created_at, updated_at)
SELECT 
  'demo-bmw-1',
  'BMW',
  'M3 Competition',
  2023,
  69900,
  3,
  'BMW.jpg',
  'High-performance sports sedan with twin-turbo engine',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE make = 'BMW' AND model = 'M3 Competition');

INSERT INTO cars (id, make, model, year, price, stock_quantity, image_url, description, created_at, updated_at)
SELECT 
  'demo-mercedes-1',
  'Mercedes-Benz',
  'C-Class AMG',
  2023,
  54900,
  7,
  'CORORA.jpg',
  'Luxury compact executive car with advanced technology',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE make = 'Mercedes-Benz' AND model = 'C-Class AMG');

INSERT INTO cars (id, make, model, year, price, stock_quantity, image_url, description, created_at, updated_at)
SELECT 
  'demo-audi-1',
  'Audi',
  'A4 Quattro',
  2023,
  47500,
  4,
  'AUDI.jpg',
  'Premium sedan with all-wheel drive and luxury features',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE make = 'Audi' AND model = 'A4 Quattro');

INSERT INTO cars (id, make, model, year, price, stock_quantity, image_url, description, created_at, updated_at)
SELECT 
  'demo-porsche-1',
  'Porsche',
  '911 Carrera',
  2023,
  115000,
  2,
  'POCHE.jpg',
  'Iconic sports car with exceptional performance and handling',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE make = 'Porsche' AND model = '911 Carrera');

INSERT INTO cars (id, make, model, year, price, stock_quantity, image_url, description, created_at, updated_at)
SELECT 
  'demo-ferrari-1',
  'Ferrari',
  'F8 Tributo',
  2023,
  280000,
  1,
  'FERARI.jpg',
  'Supercar with V8 twin-turbo engine and racing heritage',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM cars WHERE make = 'Ferrari' AND model = 'F8 Tributo');

-- Verify the updates
SELECT 
  id,
  make,
  model,
  year,
  price,
  stock_quantity,
  image_url,
  description
FROM cars
ORDER BY created_at DESC;

-- Show summary
SELECT 
    COUNT(*) as total_cars,
    COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as cars_with_images,
    COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as cars_in_stock
FROM cars;

RAISE NOTICE 'Car images have been restored! Check the cars bucket in Supabase Storage for the actual image files.';
RAISE NOTICE 'Expected image files: TESLA.jpg, BMW.jpg, CORORA.jpg, AUDI.jpg, POCHE.jpg, FERARI.jpg';
