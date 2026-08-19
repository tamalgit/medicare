-- Default Seed Data for Medicare Platform

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Platform Administrator'),
('PHARMACY_ADMIN', 'Pharmacy Owner/Manager'),
('CUSTOMER', 'Regular Customer'),
('PHARMACIST', 'Verified Pharmacist'),
('DELIVERY_AGENT', 'Delivery Driver');

-- Insert Super Admin & Users
-- Password is 'password123' (bcrypted)
INSERT INTO users (first_name, last_name, email, mobile, password_hash, is_active)
VALUES 
('Super', 'Admin', 'admin@medicare.com', '9999999999', '$2b$10$Z4x7Cg0Ic1.YC7ROAi/zZO4CpcGT4qrgbRufLw4QqrpQt8cCmWlJ6', true),
('Pharm', 'Admin', 'pharmacy@medicare.com', '8888888888', '$2b$10$Z4x7Cg0Ic1.YC7ROAi/zZO4CpcGT4qrgbRufLw4QqrpQt8cCmWlJ6', true),
('John', 'Customer', 'john@example.com', '7777777777', '$2b$10$Z4x7Cg0Ic1.YC7ROAi/zZO4CpcGT4qrgbRufLw4QqrpQt8cCmWlJ6', true),
('Jane', 'Pharmacist', 'pharmacist@medicare.com', '6666666666', '$2b$10$Z4x7Cg0Ic1.YC7ROAi/zZO4CpcGT4qrgbRufLw4QqrpQt8cCmWlJ6', true),
('Speedy', 'Driver', 'driver@medicare.com', '5555555555', '$2b$10$Z4x7Cg0Ic1.YC7ROAi/zZO4CpcGT4qrgbRufLw4QqrpQt8cCmWlJ6', true);

-- Link Users to Roles
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email='admin@medicare.com'), (SELECT id FROM roles WHERE name='SUPER_ADMIN')),
((SELECT id FROM users WHERE email='pharmacy@medicare.com'), (SELECT id FROM roles WHERE name='PHARMACY_ADMIN')),
((SELECT id FROM users WHERE email='john@example.com'), (SELECT id FROM roles WHERE name='CUSTOMER')),
((SELECT id FROM users WHERE email='pharmacist@medicare.com'), (SELECT id FROM roles WHERE name='PHARMACIST')),
((SELECT id FROM users WHERE email='driver@medicare.com'), (SELECT id FROM roles WHERE name='DELIVERY_AGENT'));

-- Insert Categories
INSERT INTO medicine_categories (name, description) VALUES
('Fever & Pain', 'Medicines for reducing fever and pain relief'),
('Diabetes', 'Medicines for blood sugar control'),
('Vitamins', 'Nutritional supplements'),
('Cardiac', 'Heart and blood pressure medication');

-- Insert Manufacturers
INSERT INTO manufacturers (name) VALUES
('Sun Pharma'),
('Cipla'),
('Dr Reddys'),
('Abbott');

-- Insert Medicines
INSERT INTO medicines (sku, name, brand_name, generic_name, manufacturer_id, category_id, strength, pack_size, mrp, selling_price, prescription_required)
VALUES 
('SKU001', 'Paracetamol 500mg', 'Crocin', 'Paracetamol', (SELECT id FROM manufacturers WHERE name='Cipla'), (SELECT id FROM medicine_categories WHERE name='Fever & Pain'), '500mg', '10 Tablets', 15.00, 12.00, false),
('SKU002', 'Metformin 500mg', 'Glycomet', 'Metformin Hydrochloride', (SELECT id FROM manufacturers WHERE name='Abbott'), (SELECT id FROM medicine_categories WHERE name='Diabetes'), '500mg', '15 Tablets', 45.00, 40.00, true),
('SKU003', 'Vitamin C 500mg', 'Limcee', 'Ascorbic Acid', (SELECT id FROM manufacturers WHERE name='Abbott'), (SELECT id FROM medicine_categories WHERE name='Vitamins'), '500mg', '15 Tablets', 25.00, 22.00, false),
('SKU004', 'Amlodipine 5mg', 'Amlokind', 'Amlodipine', (SELECT id FROM manufacturers WHERE name='Sun Pharma'), (SELECT id FROM medicine_categories WHERE name='Cardiac'), '5mg', '10 Tablets', 35.00, 30.00, true);

-- Assign Delivery Agent Profile
INSERT INTO delivery_agents (user_id, vehicle_type, vehicle_number, license_number, is_active, current_status)
VALUES
((SELECT id FROM users WHERE email='driver@medicare.com'), 'Motorcycle', 'MH-01-AB-1234', 'DL-987654321', true, 'AVAILABLE');
