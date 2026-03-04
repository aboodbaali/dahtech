-- ================================================================
-- Dah Tech - PostgreSQL Database Schema
-- ================================================================
-- Run this if you prefer explicit schema setup over JPA auto-create.
-- Usage: psql -U dahtech_user -d dahtech_db -f schema.sql
-- ================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Admins ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
    id         BIGSERIAL PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,  -- BCrypt hash
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Shops (Partner Stores) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS shops (
    id           BIGSERIAL    PRIMARY KEY,
    shop_name    VARCHAR(100) NOT NULL,
    location     VARCHAR(200) NOT NULL,
    contact_info VARCHAR(200),
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Products ──────────────────────────────────────────────────

CREATE TYPE product_status AS ENUM ('AVAILABLE', 'SOLD_ONLINE', 'SOLD_LOCALLY');

CREATE TABLE IF NOT EXISTS products (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    category        VARCHAR(50)     NOT NULL,    -- GPU, CPU, RAM, etc.
    price           NUMERIC(10, 2)  NOT NULL CHECK (price > 0),
    condition       VARCHAR(50)     NOT NULL,    -- Excellent, Good, Fair
    warranty_details VARCHAR(500),
    warranty_days   INTEGER         NOT NULL DEFAULT 30,
    description     TEXT,
    image_url       VARCHAR(500),

    -- CRITICAL: Unique QR code hash (UUID, NOT the sequential PK)
    -- This is embedded in the QR code URL for security.
    qr_code_hash    VARCHAR(64)     NOT NULL UNIQUE,

    status          product_status  NOT NULL DEFAULT 'AVAILABLE',
    shop_id         BIGINT          NOT NULL REFERENCES shops(id),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    sold_at         TIMESTAMP
);

-- Indexes for fast storefront queries
CREATE INDEX IF NOT EXISTS idx_products_status   ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_shop_id  ON products(shop_id);
-- This index is used on every QR scan — must be lightning fast
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_qr_hash ON products(qr_code_hash);

-- ── Orders ────────────────────────────────────────────────────

CREATE TYPE order_status AS ENUM (
    'PENDING',
    'DRIVER_DISPATCHED',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
);

CREATE TABLE IF NOT EXISTS orders (
    id               BIGSERIAL    PRIMARY KEY,
    product_id       BIGINT       NOT NULL REFERENCES products(id),
    customer_name    VARCHAR(100) NOT NULL,
    customer_phone   VARCHAR(20)  NOT NULL,
    customer_email   VARCHAR(100),
    shipping_address TEXT         NOT NULL,
    city             VARCHAR(100),
    order_status     order_status NOT NULL DEFAULT 'PENDING',
    notes            TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ── Auto-update updated_at trigger ────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SEED DATA (for development)
-- Remove this section before production deployment
-- ================================================================

-- Default admin: username=admin, password=DahTech@2024!
-- (BCrypt hash with strength 12)
INSERT INTO admins (username, password) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGtyUKPGkXQKUj7L5Dz5Q0v4E6u')
ON CONFLICT (username) DO NOTHING;

-- Sample partner shops in Saudi Arabia
INSERT INTO shops (shop_name, location, contact_info, is_active) VALUES
('Al-Taknia Tech Store',  'Al Olaya District, Riyadh',  '+966 50 123 4567', TRUE),
('PC World Jeddah',       'Al Hamra District, Jeddah',  '+966 55 987 6543', TRUE),
('Dammam Computer Hub',   'Al-Khobar Street, Dammam',   '+966 53 456 7890', TRUE),
('Malaz Electronics',     'Malaz, Riyadh',              '+966 56 111 2222', TRUE)
ON CONFLICT DO NOTHING;
