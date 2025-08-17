-- Complete CarBD Platform Setup Script
-- Run this to ensure everything is properly configured

-- 1. Ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

CREATE TABLE IF NOT EXISTS public.founders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  email TEXT,
  phone TEXT,
  image_path TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- 3. Create comprehensive RLS policies

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Cars policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view cars" ON public.cars;
DROP POLICY IF EXISTS "Only admins can insert cars" ON public.cars;
DROP POLICY IF EXISTS "Only admins can update cars" ON public.cars;
DROP POLICY IF EXISTS "Only admins can delete cars" ON public.cars;

CREATE POLICY "Anyone can view cars" ON public.cars
  FOR SELECT USING (true);
CREATE POLICY "Only admins can insert cars" ON public.cars
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Only admins can update cars" ON public.cars
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Only admins can delete cars" ON public.cars
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cart items policies
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Founders policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view founders" ON public.founders;
DROP POLICY IF EXISTS "Only admins can insert founders" ON public.founders;
DROP POLICY IF EXISTS "Only admins can update founders" ON public.founders;
DROP POLICY IF EXISTS "Only admins can delete founders" ON public.founders;

CREATE POLICY "Anyone can view founders" ON public.founders
  FOR SELECT USING (true);
CREATE POLICY "Only admins can insert founders" ON public.founders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Only admins can update founders" ON public.founders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Only admins can delete founders" ON public.founders
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Create functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cars_updated_at ON public.cars;
CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_founders_updated_at ON public.founders;
CREATE TRIGGER update_founders_updated_at
  BEFORE UPDATE ON public.founders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Set up storage bucket and policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cars',
  'cars', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Cars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_update" ON storage.objects;
DROP POLICY IF EXISTS "Cars_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "Cars_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "Cars_bucket_full_access" ON storage.objects;
DROP POLICY IF EXISTS "Cars_bucket_public_access" ON storage.objects;

-- Create single comprehensive storage policy
CREATE POLICY "Cars_bucket_full_access" ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'cars')
WITH CHECK (bucket_id = 'cars');

-- 6. Insert sample data if tables are empty
INSERT INTO public.cars (make, model, year, price, stock_quantity, image_url, description) 
SELECT * FROM (VALUES
  ('Toyota', 'Camry', 2023, 28500.00, 5, 'CORORA.jpg', 'Reliable and fuel-efficient sedan with advanced safety features.'),
  ('Honda', 'Civic', 2023, 24500.00, 8, 'HUNDAI.jpg', 'Compact car with excellent fuel economy and modern technology.'),
  ('Ford', 'Mustang', 2023, 35000.00, 3, 'MUSTAG.jpg', 'Iconic American muscle car with powerful performance.'),
  ('BMW', '3 Series', 2023, 42000.00, 4, 'BMW.jpg', 'Luxury sedan combining performance with premium comfort.'),
  ('Mercedes-Benz', 'C-Class', 2023, 45000.00, 2, 'ASTONI MARTIN.jpg', 'Elegant luxury sedan with cutting-edge technology.'),
  ('Audi', 'A4', 2023, 40000.00, 6, 'AUDI.jpg', 'Sophisticated sedan with quattro all-wheel drive.'),
  ('Tesla', 'Model 3', 2023, 38000.00, 7, 'TESLA.jpg', 'Electric sedan with autopilot and supercharging capability.'),
  ('Lamborghini', 'Huracan', 2023, 200000.00, 1, 'LAMBORGHINI.jpg', 'Exotic supercar with breathtaking performance.'),
  ('Porsche', '911', 2023, 120000.00, 2, 'POCHE.jpg', 'Iconic sports car with timeless design.'),
  ('Land Rover', 'Range Rover', 2023, 90000.00, 3, 'RANGE LOVER.jpg', 'Luxury SUV with exceptional off-road capability.')
) AS v(make, model, year, price, stock_quantity, image_url, description)
WHERE NOT EXISTS (SELECT 1 FROM public.cars LIMIT 1);

-- 7. Create admin user if none exists (you'll need to sign up first, then this will promote you)
-- This will be commented out - you need to sign up manually first
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- 8. Final verification
SELECT 
    'Database Setup Complete!' as status,
    (SELECT COUNT(*) FROM public.cars) as cars_count,
    (SELECT COUNT(*) FROM public.founders) as founders_count,
    (SELECT COUNT(*) FROM storage.buckets WHERE id = 'cars') as storage_bucket,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%Cars%') as storage_policies;
