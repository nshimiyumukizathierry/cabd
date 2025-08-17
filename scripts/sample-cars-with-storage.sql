-- Sample cars using images from your storage bucket
-- Update these image paths to match your actual stored images

INSERT INTO public.cars (make, model, year, price, stock_quantity, image_url, description) VALUES
('Toyota', 'Camry', 2023, 28500.00, 5, 'toyota-camry-2023.jpg', 'Reliable and fuel-efficient sedan with advanced safety features.'),
('Honda', 'Civic', 2023, 24500.00, 8, 'honda-civic-2023.jpg', 'Compact car with excellent fuel economy and modern technology.'),
('Ford', 'Mustang', 2023, 35000.00, 3, 'ford-mustang-2023.jpg', 'Iconic American muscle car with powerful performance.'),
('BMW', '3 Series', 2023, 42000.00, 4, 'bmw-3series-2023.jpg', 'Luxury sedan combining performance with premium comfort.'),
('Mercedes-Benz', 'C-Class', 2023, 45000.00, 2, 'mercedes-c-class-2023.jpg', 'Elegant luxury sedan with cutting-edge technology.'),
('Audi', 'A4', 2023, 40000.00, 6, 'audi-a4-2023.jpg', 'Sophisticated sedan with quattro all-wheel drive.'),
('Tesla', 'Model 3', 2023, 38000.00, 7, 'tesla-model3-2023.jpg', 'Electric sedan with autopilot and supercharging capability.'),
('Chevrolet', 'Silverado', 2023, 33000.00, 4, 'chevy-silverado-2023.jpg', 'Full-size pickup truck built for work and adventure.'),
('Jeep', 'Wrangler', 2023, 36000.00, 5, 'jeep-wrangler-2023.jpg', 'Rugged SUV perfect for off-road adventures.'),
('Nissan', 'Altima', 2023, 26000.00, 9, 'nissan-altima-2023.jpg', 'Midsize sedan with intelligent all-wheel drive.');

-- Note: Replace the image_url values above with the actual filenames from your 'cars' storage bucket
-- You can see the available images by visiting the /setup page
