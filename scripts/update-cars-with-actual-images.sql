-- Clear existing cars and add new ones matching your actual images
DELETE FROM public.cars;

-- Insert cars matching your actual image files
INSERT INTO public.cars (make, model, year, price, stock_quantity, image_url, description) VALUES
('Aston Martin', 'DB11', 2023, 215000.00, 2, 'ASTONI MARTIN.jpg', 'Luxury British grand tourer with exceptional performance and craftsmanship.'),
('Audi', 'A8', 2023, 86000.00, 4, 'AUDI.jpg', 'Premium luxury sedan with cutting-edge technology and quattro all-wheel drive.'),
('BMW', 'M5', 2023, 105000.00, 3, 'BMW.jpg', 'High-performance luxury sedan with M-tuned engine and advanced driving dynamics.'),
('Toyota', 'Corolla', 2023, 25000.00, 8, 'CORORA.jpg', 'Reliable and fuel-efficient compact sedan, perfect for daily commuting.'),
('Ferrari', '488 GTB', 2023, 280000.00, 1, 'FERARI.jpg', 'Italian supercar with breathtaking performance and iconic design.'),
('Hyundai', 'Tucson', 2023, 32000.00, 6, 'HUNDAI.jpg', 'Modern compact SUV with advanced safety features and stylish design.'),
('Kia', 'Sportage', 2023, 28000.00, 5, 'KIA SPORTAGE.jpg', 'Versatile compact SUV with excellent warranty and modern technology.'),
('Lamborghini', 'Huracán', 2023, 250000.00, 1, 'LAMBORGHINI.jpg', 'Exotic Italian supercar with aggressive styling and incredible performance.'),
('Land Rover', 'Defender 90', 2023, 55000.00, 3, 'LAND LOVER B2.jpg', 'Rugged and capable off-road SUV with modern luxury features.'),
('Land Rover', 'Defender 110', 2023, 58000.00, 2, 'LAND LOVER B4.jpg', 'Extended wheelbase Defender with more space and versatility.'),
('Land Rover', 'Discovery', 2023, 60000.00, 4, 'LAND LOVER.jpg', 'Premium SUV combining luxury comfort with off-road capability.'),
('Lexus', 'LS 500', 2023, 78000.00, 3, 'LEXUS.jpg', 'Japanese luxury flagship sedan with exceptional refinement and reliability.'),
('Ford', 'Mustang GT', 2023, 45000.00, 4, 'MUSTAG.jpg', 'Iconic American muscle car with powerful V8 engine and classic styling.'),
('Porsche', '911 Carrera', 2023, 115000.00, 2, 'POCHE.jpg', 'Legendary sports car with perfect balance of performance and daily usability.'),
('Land Rover', 'Range Rover', 2023, 95000.00, 2, 'RANGE LOVER.jpg', 'Ultimate luxury SUV combining elegance with unmatched off-road capability.'),
('Tesla', 'Model S', 2023, 95000.00, 5, 'TESLA.jpg', 'Electric luxury sedan with autopilot, supercharging, and cutting-edge technology.'),
('Volkswagen', 'Golf GTI', 2023, 35000.00, 6, 'VOLKSWAGHEN.jpg', 'Hot hatch with sporty performance and German engineering excellence.');

-- Verify the data was inserted correctly
SELECT make, model, year, price, stock_quantity, image_url FROM public.cars ORDER BY make;
