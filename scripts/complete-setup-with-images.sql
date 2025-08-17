-- Complete setup script with sample cars and proper image references
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cars table if it doesn't exist
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user',
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create founders table if it doesn't exist
CREATE TABLE IF NOT EXISTS founders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    bio TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    image_path TEXT,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, car_id)
);

-- Clear existing data
DELETE FROM cart_items;
DELETE FROM favorites;
DELETE FROM cars;
DELETE FROM founders;

-- Insert sample cars with proper image references
INSERT INTO cars (id, make, model, year, price, stock_quantity, image_url, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Tesla', 'Model S', 2023, 89990, 5, 'TESLA.jpg', 'Electric luxury sedan with autopilot capabilities and premium interior', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'BMW', 'M3 Competition', 2023, 69900, 3, 'BMW.jpg', 'High-performance sports sedan with twin-turbo engine', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Mercedes-Benz', 'C-Class AMG', 2023, 54900, 7, 'CORORA.jpg', 'Luxury compact executive car with advanced technology', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Audi', 'A4 Quattro', 2023, 47500, 4, 'AUDI.jpg', 'Premium sedan with all-wheel drive and luxury features', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Porsche', '911 Carrera', 2023, 115000, 2, 'POCHE.jpg', 'Iconic sports car with exceptional performance and handling', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Ferrari', 'F8 Tributo', 2023, 280000, 1, 'FERARI.jpg', 'Supercar with V8 twin-turbo engine and racing heritage', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Lamborghini', 'Huracán', 2023, 248295, 1, 'LAMBORGHINI.jpg', 'Italian supercar with naturally aspirated V10 engine', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Ford', 'Mustang GT', 2023, 37315, 8, 'MUSTAG.jpg', 'American muscle car with powerful V8 engine', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Toyota', 'Corolla', 2023, 24100, 15, 'CORORA.jpg', 'Reliable and fuel-efficient compact sedan', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Hyundai', 'Elantra', 2023, 20650, 12, 'HUNDAI.jpg', 'Stylish compact sedan with advanced safety features', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'Kia', 'Sportage', 2023, 26490, 6, 'KIA SPORTAGE.jpg', 'Compact SUV with modern design and technology', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Lexus', 'ES 350', 2023, 41900, 4, 'LEXUS.jpg', 'Luxury sedan with refined comfort and reliability', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'Land Rover', 'Range Rover', 2023, 104500, 2, 'RANGE LOVER.jpg', 'Luxury SUV with off-road capabilities', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'Land Rover', 'Defender', 2023, 56300, 3, 'LAND LOVER.jpg', 'Rugged SUV built for adventure', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'Volkswagen', 'Golf GTI', 2023, 31895, 5, 'VOLKSWAGHEN.jpg', 'Hot hatch with sporty performance', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', 'Aston Martin', 'DB11', 2023, 205600, 1, 'ASTONI MARTIN.jpg', 'British grand tourer with elegant design', NOW(), NOW());

-- Insert sample founders
INSERT INTO founders (id, name, position, bio, email, phone, image_path, display_order, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'John Smith', 'CEO & Founder', 'Visionary leader with 15+ years in automotive industry. Passionate about revolutionizing car buying experience through technology and exceptional customer service.', 'john@carbd.com', '+1 (555) 123-4567', 'founder-1.jpg', 1, NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'CTO & Co-Founder', 'Technology expert with deep expertise in e-commerce platforms and automotive systems. Leads our technical innovation and platform development.', 'sarah@carbd.com', '+1 (555) 123-4568', 'founder-2.jpg', 2, NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Michael Chen', 'Head of Operations', 'Operations specialist with extensive experience in automotive logistics and supply chain management. Ensures smooth operations and customer satisfaction.', 'michael@carbd.com', '+1 (555) 123-4569', 'founder-3.jpg', 3, NOW());

-- Enable RLS (Row Level Security)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for cars (public read access)
CREATE POLICY "Cars are viewable by everyone" ON cars FOR SELECT USING (true);
CREATE POLICY "Cars are insertable by authenticated users" ON cars FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Cars are updatable by authenticated users" ON cars FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Cars are deletable by authenticated users" ON cars FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for founders (public read access)
CREATE POLICY "Founders are viewable by everyone" ON founders FOR SELECT USING (true);
CREATE POLICY "Founders are insertable by authenticated users" ON founders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Founders are updatable by authenticated users" ON founders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Founders are deletable by authenticated users" ON founders FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for cart_items
CREATE POLICY "Users can view own cart items" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Create policies for favorites
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for cars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('cars', 'cars', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for cars bucket
CREATE POLICY "Cars images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'cars');
CREATE POLICY "Authenticated users can upload car images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cars' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update car images" ON storage.objects FOR UPDATE USING (bucket_id = 'cars' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete car images" ON storage.objects FOR DELETE USING (bucket_id = 'cars' AND auth.role() = 'authenticated');

-- Verify setup
SELECT 
    'Cars' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as records_with_images
FROM cars
UNION ALL
SELECT 
    'Founders' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN image_path IS NOT NULL THEN 1 END) as records_with_images
FROM founders;

-- Show sample data
SELECT id, make, model, year, price, stock_quantity, image_url FROM cars ORDER BY created_at DESC LIMIT 5;
SELECT id, name, position, email, image_path FROM founders ORDER BY display_order;

RAISE NOTICE 'Database setup complete! ✅';
RAISE NOTICE 'Cars table: % records created', (SELECT COUNT(*) FROM cars);
RAISE NOTICE 'Founders table: % records created', (SELECT COUNT(*) FROM founders);
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Upload car images to the "cars" bucket in Supabase Storage';
RAISE NOTICE '2. Expected image files: TESLA.jpg, BMW.jpg, CORORA.jpg, AUDI.jpg, POCHE.jpg, FERARI.jpg, etc.';
RAISE NOTICE '3. Upload founder images: founder-1.jpg, founder-2.jpg, founder-3.jpg';
RAISE NOTICE '4. Test the website - cars and founders should now display properly!';
