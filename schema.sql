-- ============================================================
--  Slice & Spice Pizza Shop — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS pizza_shop;
USE pizza_shop;

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu / Pizzas
CREATE TABLE IF NOT EXISTS pizzas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    base_price  DECIMAL(10,2) NOT NULL,
    image_url   VARCHAR(255),
    available   BOOLEAN DEFAULT TRUE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    customer_id      INT NOT NULL,
    delivery_address TEXT NOT NULL,
    status           ENUM('Pending','Preparing','Ready','Out for Delivery','Delivered') DEFAULT 'Pending',
    total_amount     DECIMAL(10,2) DEFAULT 0,
    paid             BOOLEAN DEFAULT FALSE,
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    pizza_id    INT NOT NULL,
    size        ENUM('Small','Medium','Large') NOT NULL,
    quantity    INT DEFAULT 1,
    toppings    JSON,
    unit_price  DECIMAL(10,2) NOT NULL,
    subtotal    DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (pizza_id) REFERENCES pizzas(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL UNIQUE,
    method        ENUM('Cash','GCash','Card') NOT NULL,
    amount_paid   DECIMAL(10,2) NOT NULL,
    change_given  DECIMAL(10,2) DEFAULT 0,
    processed_by  VARCHAR(100),
    processed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ── Seed Menu ──────────────────────────────────────────────
INSERT INTO pizzas (name, description, base_price) VALUES
('Margherita',      'Classic tomato & mozzarella',       199.00),
('Pepperoni Blast', 'Double pepperoni with cheddar',      249.00),
('BBQ Chicken',     'Smoky BBQ with grilled chicken',     269.00),
('Veggie Supreme',  'Bell peppers, mushrooms, olives',    219.00),
('Hawaiian',        'Ham & pineapple with mozza',         229.00),
('Four Cheese',     'Mozza, cheddar, gouda, parmesan',    279.00);
