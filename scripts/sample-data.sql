-- Insert sample cars (run this after setting up an admin user)
INSERT INTO public.cars (make, model, year, price, stock_quantity, image_url, description) VALUES
('Toyota', 'Camry', 2023, 28500.00, 5, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500', 'Reliable and fuel-efficient sedan with advanced safety features.'),
('Honda', 'Civic', 2023, 24500.00, 8, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500', 'Compact car with excellent fuel economy and modern technology.'),
('Ford', 'Mustang', 2023, 35000.00, 3, 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=500', 'Iconic American muscle car with powerful performance.'),
('BMW', '3 Series', 2023, 42000.00, 4, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500', 'Luxury sedan combining performance with premium comfort.'),
('Mercedes-Benz', 'C-Class', 2023, 45000.00, 2, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500', 'Elegant luxury sedan with cutting-edge technology.'),
('Audi', 'A4', 2023, 40000.00, 6, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500', 'Sophisticated sedan with quattro all-wheel drive.'),
('Tesla', 'Model 3', 2023, 38000.00, 7, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500', 'Electric sedan with autopilot and supercharging capability.'),
('Chevrolet', 'Silverado', 2023, 33000.00, 4, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500', 'Full-size pickup truck built for work and adventure.'),
('Jeep', 'Wrangler', 2023, 36000.00, 5, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500', 'Rugged SUV perfect for off-road adventures.'),
('Nissan', 'Altima', 2023, 26000.00, 9, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500', 'Midsize sedan with intelligent all-wheel drive.');

-- Create an admin user (you'll need to sign up first, then update the role)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@carbd.com';
