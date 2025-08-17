-- Create founders table
CREATE TABLE IF NOT EXISTS founders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  email TEXT,
  phone TEXT,
  image_path TEXT,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on founders" ON founders
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage founders" ON founders
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default founders
INSERT INTO founders (name, position, bio, email, phone, display_order) VALUES
('Thierry', 'Co-Founder & CEO', 'Visionary leader with expertise in automotive industry and international trade.', 'thierry@carbd.com', '+880-1234-567890', 1),
('Jassir', 'Co-Founder & CTO', 'Technology expert specializing in logistics and supply chain management.', 'jassir@carbd.com', '+880-1234-567891', 2),
('Sadman', 'Co-Founder & COO', 'Operations specialist focused on customer experience and business development.', 'sadman@carbd.com', '+880-1234-567892', 3)
ON CONFLICT (id) DO NOTHING;
