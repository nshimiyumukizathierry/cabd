-- Create analytics table for tracking metrics
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table for revenue tracking
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure founders table exists with correct structure
CREATE TABLE IF NOT EXISTS founders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- Insert sample analytics data
INSERT INTO analytics (metric_name, metric_value, date) VALUES
  ('cars_sold', 15, CURRENT_DATE - INTERVAL '5 months'),
  ('cars_sold', 22, CURRENT_DATE - INTERVAL '4 months'),
  ('cars_sold', 18, CURRENT_DATE - INTERVAL '3 months'),
  ('cars_sold', 28, CURRENT_DATE - INTERVAL '2 months'),
  ('cars_sold', 35, CURRENT_DATE - INTERVAL '1 month'),
  ('cars_sold', 42, CURRENT_DATE),
  ('users_registered', 8, CURRENT_DATE - INTERVAL '5 months'),
  ('users_registered', 12, CURRENT_DATE - INTERVAL '4 months'),
  ('users_registered', 15, CURRENT_DATE - INTERVAL '3 months'),
  ('users_registered', 20, CURRENT_DATE - INTERVAL '2 months'),
  ('users_registered', 25, CURRENT_DATE - INTERVAL '1 month'),
  ('users_registered', 30, CURRENT_DATE),
  ('revenue', 450000, CURRENT_DATE - INTERVAL '5 months'),
  ('revenue', 660000, CURRENT_DATE - INTERVAL '4 months'),
  ('revenue', 540000, CURRENT_DATE - INTERVAL '3 months'),
  ('revenue', 840000, CURRENT_DATE - INTERVAL '2 months'),
  ('revenue', 1050000, CURRENT_DATE - INTERVAL '1 month'),
  ('revenue', 1260000, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, status) 
SELECT 
  id,
  (RANDOM() * 50000 + 10000)::NUMERIC,
  CASE WHEN RANDOM() > 0.8 THEN 'pending' ELSE 'completed' END
FROM auth.users 
LIMIT 10
ON CONFLICT DO NOTHING;

-- Insert sample founders
INSERT INTO founders (name, role, bio, image_url) VALUES
  ('John Smith', 'CEO & Founder', 'Passionate about connecting people with their dream cars. 15+ years in automotive industry.', NULL),
  ('Sarah Johnson', 'CTO', 'Tech enthusiast building the future of car buying. Former Tesla engineer.', NULL),
  ('Mike Davis', 'Head of Sales', 'Expert in automotive sales with a customer-first approach. 10+ years experience.', NULL)
ON CONFLICT DO NOTHING;

-- Set up RLS policies
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Analytics viewable by admins" ON analytics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Analytics manageable by admins" ON analytics FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Orders policies
CREATE POLICY "Orders viewable by admins" ON orders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Orders manageable by admins" ON orders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Founders policies
CREATE POLICY "Founders viewable by everyone" ON founders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Founders manageable by admins" ON founders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
