USE pos_system;

-- Admin user (password: admin123)
-- Cashier user (password: cashier123)
-- Passwords are inserted via seed.js with bcrypt hashing

-- Sample Categories
INSERT IGNORE INTO categories (name, description) VALUES
('Beverages', 'Drinks, juices, water, and other beverages'),
('Snacks', 'Chips, cookies, candy, and other snacks'),
('Electronics', 'Cables, chargers, earphones, and accessories'),
('Household', 'Cleaning supplies, toiletries, and household items'),
('Stationery', 'Pens, notebooks, paper, and office supplies');

-- Sample Products
INSERT IGNORE INTO products (barcode, name, description, category_id, cost_price, sell_price, stock_qty, min_stock, image_url) VALUES
('8850999220017', 'Coca-Cola 330ml', 'Classic Coca-Cola can 330ml', 1, 0.35, 0.75, 150, 20, '/uploads/products/coca_cola.png'),
('8851234560012', 'Pepsi 330ml', 'Pepsi cola can 330ml', 1, 0.30, 0.70, 120, 20, '/uploads/products/pepsi.png'),
('8850001234567', 'Mineral Water 500ml', 'Pure mineral water bottle', 1, 0.15, 0.50, 200, 30, '/uploads/products/mineral_water.png'),
('8850009876543', 'Orange Juice 1L', 'Fresh orange juice carton', 1, 1.20, 2.50, 60, 10, '/uploads/products/orange_juice.png'),
('8851111222333', 'Iced Coffee 240ml', 'Premium iced coffee can', 1, 0.45, 1.00, 80, 15, '/uploads/products/iced_coffee.png'),
('8852222333444', 'Lays Classic 75g', 'Lays potato chips original flavor', 2, 0.50, 1.25, 90, 15, '/uploads/products/lays_classic.png'),
('8852223334445', 'Oreo Cookies 133g', 'Oreo chocolate sandwich cookies', 2, 0.80, 1.75, 70, 10, '/uploads/products/oreo_cookies.png'),
('8852224335446', 'KitKat 4-Finger', 'Nestle KitKat chocolate wafer bar', 2, 0.60, 1.50, 100, 15, '/uploads/products/kitkat.png'),
('8853333444555', 'Snickers Bar', 'Snickers chocolate peanut bar', 2, 0.55, 1.25, 85, 10, '/uploads/products/snickers.png'),
('8854444555666', 'USB-C Cable 1m', 'High-quality USB-C charging cable', 3, 1.50, 4.50, 40, 5, '/uploads/products/usbc_cable.png'),
('8854445556667', 'Earphones Basic', 'Wired earphones with microphone', 3, 2.00, 5.99, 35, 5, '/uploads/products/earphones.png'),
('8854446557668', 'Phone Charger 10W', 'Universal USB phone charger', 3, 3.00, 7.50, 25, 5, '/uploads/products/phone_charger.png'),
('8855555666777', 'Dish Soap 500ml', 'Lemon scented dish washing liquid', 4, 0.80, 1.99, 60, 10, '/uploads/products/dish_soap.png'),
('8855556667778', 'Tissue Box 200pcs', 'Soft facial tissue box', 4, 0.60, 1.50, 100, 15, '/uploads/products/tissue_box.png'),
('8856666777888', 'Ballpoint Pen Blue', 'Smooth writing ballpoint pen', 5, 0.10, 0.50, 200, 30, '/uploads/products/ballpoint_pen.png'),
('8856667778889', 'Notebook A5 80pg', 'Ruled notebook A5 size 80 pages', 5, 0.40, 1.25, 150, 20, '/uploads/products/notebook_a5.png');

-- Sample Customers
INSERT IGNORE INTO customers (name, phone, email, address) VALUES
('Walk-in Customer', NULL, NULL, NULL),
('Sokha Chea', '+855 12 111 222', 'sokha@email.com', 'Street 63, Phnom Penh'),
('Dara Kim', '+855 12 333 444', 'dara.kim@email.com', 'Street 271, Phnom Penh'),
('Bopha Ly', '+855 12 555 666', 'bopha.ly@email.com', 'Street 110, Phnom Penh');
