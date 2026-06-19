CREATE DATABASE IF NOT EXISTS pos_system;
USE pos_system;

-- Settings table for configurable values
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'cashier') DEFAULT 'cashier',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barcode VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  sell_price DECIMAL(12,2) NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  min_stock INT DEFAULT 10,
  unit VARCHAR(20) DEFAULT 'pcs',
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  address TEXT,
  points INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  customer_id INT,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_type ENUM('percentage', 'fixed') DEFAULT 'fixed',
  discount_value DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL,
  change_amount DECIMAL(12,2) DEFAULT 0,
  payment_method ENUM('cash', 'card', 'qr', 'other') DEFAULT 'cash',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  barcode VARCHAR(50),
  qty INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  type ENUM('in', 'out', 'adjustment', 'sale') NOT NULL,
  qty INT NOT NULL,
  reference VARCHAR(100),
  note TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for foreign key performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_user_id ON stock_movements(user_id);

-- Insert default settings
INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
('tax_rate', '10', 'Default tax rate percentage'),
('exchange_rate', '4100', 'USD to KHR exchange rate'),
('shop_name', 'MekongPOS', 'Shop display name'),
('shop_address', 'Phnom Penh, Cambodia', 'Shop address'),
('shop_phone', '+855 12 345 678', 'Shop phone number'),
('receipt_footer', 'Thank you for shopping with us!', 'Receipt footer message'),
('currency_primary', 'USD', 'Primary currency'),
('currency_secondary', 'KHR', 'Secondary currency'),
('logo_url', '', 'Shop logo image URL');

-- Migration: Add unit column to products for existing databases
-- Run manually if database already exists:
-- ALTER TABLE products ADD COLUMN unit VARCHAR(20) DEFAULT 'pcs' AFTER min_stock;

-- Migration: Add logo_url setting for existing databases
-- Run manually if database already exists:
-- INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES ('logo_url', '', 'Shop logo image URL');
