-- ============================================================================
-- SALESPREDICTER: SEED DATA SCRIPT
-- Dataset: `bustling-wharf-485615-s9.sales_predictor`
-- Populates master outlets & 30-day historical sales for TimesFM 3.0 training
-- ============================================================================

-- 1. Insert Master Outlets
INSERT INTO `bustling-wharf-485615-s9.sales_predictor.kitchens_and_outlets`
(kitchen_id, kitchen_name, outlet_id, outlet_name, join_code, chef_name, city, active)
VALUES
('kitchen_a', 'Jaipur Central Cloud Kitchen', 'outlet_aa', 'Civil Lines Express', 'KITCH-AA', 'Chef Rajesh Sharma', 'Jaipur', TRUE),
('kitchen_a', 'Jaipur Central Cloud Kitchen', 'outlet_ab', 'Malviya Nagar Hub', 'KITCH-AB', 'Chef Anita Meena', 'Jaipur', TRUE),
('kitchen_b', 'Delhi NCR Cloud Network', 'outlet_ba', 'Connaught Place Central', 'KITCH-BA', 'Chef Vikram Singh', 'Delhi', TRUE);

-- 2. Insert 30-Day Shift Sales History for TimesFM 3.0
INSERT INTO `bustling-wharf-485615-s9.sales_predictor.restaurant_sales`
(sale_date, kitchen_id, outlet_id, meal_slot, item_name, quantity_sold, unit, revenue)
SELECT 
  DATE_SUB(CURRENT_DATE(), INTERVAL day DAY) AS sale_date,
  'kitchen_a' AS kitchen_id,
  'outlet_aa' AS outlet_id,
  shift AS meal_slot,
  item AS item_name,
  CAST(ROUND(base_qty * (0.85 + (RAND() * 0.3))) AS INT64) AS quantity_sold,
  unit,
  CAST(ROUND(base_qty * unit_price) AS NUMERIC) AS revenue
FROM 
  UNNEST(GENERATE_ARRAY(1, 30)) AS day
CROSS JOIN (
  SELECT 'lunch' AS shift, 'Chicken Biryani' AS item, 45 AS base_qty, 'portions' AS unit, 280 AS unit_price UNION ALL
  SELECT 'lunch', 'Butter Chicken Gravy', 28, 'litres', 450 UNION ALL
  SELECT 'lunch', 'Dal Makhani Base', 35, 'litres', 320 UNION ALL
  SELECT 'lunch', 'Paneer Butter Masala', 22, 'portions', 240 UNION ALL
  SELECT 'lunch', 'Steamed Basmati Rice', 30, 'kg', 120 UNION ALL
  SELECT 'lunch', 'Naan Dough Batch', 18, 'kg', 90 UNION ALL
  SELECT 'dinner', 'Chicken Dum Biryani', 60, 'portions', 300 UNION ALL
  SELECT 'dinner', 'Mutton Rogan Josh Gravy', 25, 'litres', 650 UNION ALL
  SELECT 'dinner', 'Dal Makhani Base', 45, 'litres', 320 UNION ALL
  SELECT 'dinner', 'Paneer Tikka Base', 32, 'portions', 260 UNION ALL
  SELECT 'breakfast', 'Masala Chai Base', 40, 'litres', 80 UNION ALL
  SELECT 'breakfast', 'Poha Batch', 25, 'kg', 120 UNION ALL
  SELECT 'breakfast', 'Idli Batter', 30, 'litres', 90
);
