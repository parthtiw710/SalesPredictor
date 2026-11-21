import { NextResponse } from 'next/server';
import { queryBigQuery, PROJECT_ID, DATASET_ID } from '@/lib/gcp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  const log: string[] = [];
  try {
    // 1. Ensure Master Outlets Table Exists & Populated (All 5 Outlets)
    const createOutletsSql = `
      CREATE TABLE IF NOT EXISTS \`${PROJECT_ID}.${DATASET_ID}.kitchens_and_outlets\` (
        kitchen_id STRING NOT NULL,
        kitchen_name STRING NOT NULL,
        outlet_id STRING NOT NULL,
        outlet_name STRING NOT NULL,
        join_code STRING NOT NULL,
        chef_name STRING NOT NULL,
        city STRING NOT NULL,
        active BOOLEAN DEFAULT TRUE
      );
    `;
    await queryBigQuery(createOutletsSql);
    log.push('Created/verified kitchens_and_outlets table');

    // Clean old seed outlets & re-insert fresh
    try {
      await queryBigQuery(`DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.kitchens_and_outlets\` WHERE TRUE;`);
    } catch {
      // ignore
    }

    const insertOutletsSql = `
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.kitchens_and_outlets\`
      (kitchen_id, kitchen_name, outlet_id, outlet_name, join_code, chef_name, city, active)
      VALUES
      ('kitchen_a', 'Jaipur Central Cloud Kitchen', 'outlet_aa', 'Civil Lines Express', 'KITCH-AA', 'Chef Rajesh Sharma', 'Jaipur', TRUE),
      ('kitchen_a', 'Jaipur Central Cloud Kitchen', 'outlet_ab', 'Malviya Nagar Hub', 'KITCH-AB', 'Chef Anita Meena', 'Jaipur', TRUE),
      ('kitchen_b', 'Delhi NCR Cloud Network', 'outlet_ba', 'Connaught Place Central', 'KITCH-BA', 'Chef Vikram Singh', 'Delhi', TRUE),
      ('kitchen_c', 'Bangalore South Kitchens', 'outlet_ca', 'Indiranagar Cloud Hub', 'KITCH-CA', 'Chef Priya Nair', 'Bengaluru', TRUE),
      ('kitchen_d', 'Mumbai West Cloud Hub', 'outlet_da', 'Bandra West Kitchen', 'KITCH-DA', 'Chef Farhan Khan', 'Mumbai', TRUE);
    `;
    await queryBigQuery(insertOutletsSql);
    log.push('Inserted 5 master kitchen outlets (Jaipur, Delhi, Bengaluru, Mumbai)');

    // 2. Ensure Restaurant Sales Table Exists (Partitioned & Clustered)
    const createSalesSql = `
      CREATE TABLE IF NOT EXISTS \`${PROJECT_ID}.${DATASET_ID}.restaurant_sales\` (
        sale_date DATE NOT NULL,
        kitchen_id STRING NOT NULL,
        outlet_id STRING NOT NULL,
        meal_slot STRING NOT NULL,
        item_name STRING NOT NULL,
        quantity_sold INT64 NOT NULL,
        unit STRING NOT NULL,
        revenue NUMERIC NOT NULL
      )
      PARTITION BY sale_date
      CLUSTER BY kitchen_id, outlet_id, meal_slot;
    `;
    await queryBigQuery(createSalesSql);
    log.push('Created/verified restaurant_sales partitioned table');

    // Insert 45-day sales history across ALL 5 Outlets and 15+ menu items (>3,300 rows)
    const insertSalesSql = `
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.restaurant_sales\`
      (sale_date, kitchen_id, outlet_id, meal_slot, item_name, quantity_sold, unit, revenue)
      SELECT 
        DATE_SUB(CURRENT_DATE(), INTERVAL day DAY) AS sale_date,
        outlets.kitchen_id,
        outlets.outlet_id,
        items.shift AS meal_slot,
        items.item AS item_name,
        CAST(ROUND(items.base_qty * (0.85 + (RAND() * 0.35))) AS INT64) AS quantity_sold,
        items.unit,
        CAST(ROUND(items.base_qty * items.unit_price) AS NUMERIC) AS revenue
      FROM 
        UNNEST(GENERATE_ARRAY(1, 45)) AS day
      CROSS JOIN (
        SELECT 'kitchen_a' AS kitchen_id, 'outlet_aa' AS outlet_id UNION ALL
        SELECT 'kitchen_a', 'outlet_ab' UNION ALL
        SELECT 'kitchen_b', 'outlet_ba' UNION ALL
        SELECT 'kitchen_c', 'outlet_ca' UNION ALL
        SELECT 'kitchen_d', 'outlet_da'
      ) AS outlets
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
        SELECT 'dinner', 'Tandoori Roti Dough', 35, 'kg', 80 UNION ALL
        SELECT 'breakfast', 'Masala Chai Base', 40, 'litres', 80 UNION ALL
        SELECT 'breakfast', 'Poha Batch', 25, 'kg', 120 UNION ALL
        SELECT 'breakfast', 'Idli Batter', 30, 'litres', 90 UNION ALL
        SELECT 'breakfast', 'Sambar Pot', 35, 'litres', 110
      ) AS items;
    `;
    await queryBigQuery(insertSalesSql);
    log.push('Inserted 45-day historical sales dataset across all 5 outlets (over 3,300 data points)');

    // 3. Create or Replace Feature Store View (with weather covariates)
    const createFeatureStoreSql = `
      CREATE OR REPLACE VIEW \`${PROJECT_ID}.${DATASET_ID}.sales_feature_store\` AS
      SELECT 
        s.sale_date,
        s.kitchen_id,
        s.outlet_id,
        s.meal_slot,
        s.item_name,
        s.quantity_sold,
        s.revenue,
        s.unit,
        28.5 AS ambient_temp_c,
        0.0 AS rain_mm,
        FALSE AS was_raining,
        EXTRACT(DAYOFWEEK FROM s.sale_date) IN (1, 7) AS is_weekend,
        EXTRACT(DAYOFWEEK FROM s.sale_date) AS day_of_week_num,
        'Regular Festive Prep' AS regional_event_context,
        1.15 AS base_event_demand_multiplier
      FROM \`${PROJECT_ID}.${DATASET_ID}.restaurant_sales\` s;
    `;
    await queryBigQuery(createFeatureStoreSql);
    log.push('Created sales_feature_store view for TimesFM and rolling forecasting');

    // 4. Ensure Daily Raw Inputs Exists & Populated
    const createRawInputsSql = `
      CREATE TABLE IF NOT EXISTS \`${PROJECT_ID}.${DATASET_ID}.daily_raw_inputs\` (
        entry_id STRING NOT NULL,
        created_at TIMESTAMP NOT NULL,
        kitchen_id STRING NOT NULL,
        outlet_id STRING NOT NULL,
        source_type STRING NOT NULL,
        vendor_name STRING,
        item_name STRING NOT NULL,
        quantity NUMERIC NOT NULL,
        unit STRING NOT NULL,
        rate NUMERIC NOT NULL,
        row_total NUMERIC NOT NULL,
        total_bill_amount NUMERIC NOT NULL,
        chef_verified BOOLEAN DEFAULT TRUE
      )
      PARTITION BY DATE(created_at)
      CLUSTER BY kitchen_id, outlet_id;
    `;
    await queryBigQuery(createRawInputsSql);

    const insertRawInputsSql = `
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.daily_raw_inputs\`
      (entry_id, created_at, kitchen_id, outlet_id, source_type, vendor_name, item_name, quantity, unit, rate, row_total, total_bill_amount, chef_verified)
      VALUES
      ('raw_001', CURRENT_TIMESTAMP(), 'kitchen_a', 'outlet_aa', 'GEMINI_OCR', 'मुहाना फल व सब्जी मंडी', 'प्याज (Onions)', 50, 'kg', 35, 1750, 4950, TRUE),
      ('raw_002', CURRENT_TIMESTAMP(), 'kitchen_a', 'outlet_aa', 'GEMINI_OCR', 'मुहाना फल व सब्जी मंडी', 'टमाटर (Tomatoes)', 40, 'kg', 40, 1600, 4950, TRUE),
      ('raw_003', CURRENT_TIMESTAMP(), 'kitchen_a', 'outlet_aa', 'GEMINI_OCR', 'मुहाना फल व सब्जी मंडी', 'अदरक लहसुन (Ginger Garlic)', 10, 'kg', 160, 1600, 4950, TRUE),
      ('raw_004', CURRENT_TIMESTAMP(), 'kitchen_b', 'outlet_ba', 'GEMINI_OCR', 'आज़ादपुर थोक सब्जी मंडी', 'देसी प्याज (Onions)', 80, 'kg', 32, 2560, 6160, TRUE),
      ('raw_005', CURRENT_TIMESTAMP(), 'kitchen_b', 'outlet_ba', 'GEMINI_OCR', 'आज़ादपुर थोक सब्जी मंडी', 'पनीर फ्रेश (Paneer)', 12, 'kg', 300, 3600, 6160, TRUE),
      ('raw_006', CURRENT_TIMESTAMP(), 'kitchen_c', 'outlet_ca', 'GEMINI_OCR', 'यशवंतपुर एपीएमसी मंडी', 'सांभर प्याज (Shallots)', 30, 'kg', 55, 1650, 4650, TRUE),
      ('raw_007', CURRENT_TIMESTAMP(), 'kitchen_c', 'outlet_ca', 'GEMINI_OCR', 'यशवंतपुर एपीएमसी मंडी', 'बासमती चावल (Rice)', 50, 'kg', 60, 3000, 4650, TRUE),
      ('raw_008', CURRENT_TIMESTAMP(), 'kitchen_d', 'outlet_da', 'GEMINI_OCR', 'वाशी एपीएमसी मार्केट', 'प्याज (Onions)', 60, 'kg', 38, 2280, 5880, TRUE),
      ('raw_009', CURRENT_TIMESTAMP(), 'kitchen_d', 'outlet_da', 'GEMINI_OCR', 'वाशी एपीएमसी मार्केट', 'मटन फ्रेश (Mutton)', 6, 'kg', 600, 3600, 5880, TRUE);
    `;
    await queryBigQuery(insertRawInputsSql);
    log.push('Created and seeded daily_raw_inputs procurement table with verified Mandi receipts');

    // 5. Ensure Daily Bulletin Cache Exists (Matching cache.ts schema)
    const createCacheSql = `
      CREATE TABLE IF NOT EXISTS \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\` (
        forecast_date DATE NOT NULL,
        kitchen_id STRING NOT NULL,
        outlet_id STRING NOT NULL,
        meal_slot STRING NOT NULL,
        lang_code STRING NOT NULL,
        voice_name STRING NOT NULL,
        bulletin_text STRING NOT NULL,
        audio_url STRING,
        dynamic_reason STRING,
        items_json STRING,
        created_at TIMESTAMP NOT NULL
      )
      PARTITION BY forecast_date
      CLUSTER BY kitchen_id, outlet_id, meal_slot, lang_code;
    `;
    await queryBigQuery(createCacheSql);

    // Pre-populate realistic shift dispatches for ALL 5 Outlets so Shift History & Audio are feature-rich
    const insertCacheSql = `
      INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\`
      (forecast_date, kitchen_id, outlet_id, meal_slot, lang_code, voice_name, bulletin_text, audio_url, dynamic_reason, items_json, created_at)
      VALUES
      -- 1. Civil Lines Express (Jaipur)
      (CURRENT_DATE(), 'kitchen_a', 'outlet_aa', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 45 प्लेट चिकन बिरयानी, 28 लीटर बटर चिकन, 35 लीटर दाल मखनी। बारिश के कारण डिलीवरी ऑर्डर्स में 30% उछाल का अनुमान है।', '', 'बारिश के कारण डिलीवरी ऑर्डर्स में 30% उछाल का अनुमान है।', '[{"item_name":"चिकन बिरयानी","predicted_qty":45,"unit":"portions"},{"item_name":"बटर चिकन ग्रेवी","predicted_qty":28,"unit":"litres"},{"item_name":"दाल मखनी बेस","predicted_qty":35,"unit":"litres"},{"item_name":"बासमती चावल","predicted_qty":30,"unit":"kg"}]', CURRENT_TIMESTAMP()),
      (CURRENT_DATE(), 'kitchen_a', 'outlet_aa', 'breakfast', 'hi', 'hi-IN-Neural2-A', 'नाश्ता: 40 लीटर मसाला चाय, 25 किलो पोहा, 30 लीटर इडली घोल। सामान्य परिचालन मांग।', '', NULL, '[{"item_name":"मसाला चाय बेस","predicted_qty":40,"unit":"litres"},{"item_name":"पोहा सामग्री","predicted_qty":25,"unit":"kg"},{"item_name":"इडली घोल","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP()),
      (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_a', 'outlet_aa', 'dinner', 'hi', 'hi-IN-Neural2-A', 'डिनर: 60 प्लेट चिकन दम बिरयानी, 25 लीटर मटन रोगन जोश, 45 लीटर दाल मखनी। वीकेंड रश के कारण 25% अतिरिक्त मांग।', '', 'वीकेंड रश के कारण 25% अतिरिक्त मांग।', '[{"item_name":"चिकन दम बिरयानी","predicted_qty":60,"unit":"portions"},{"item_name":"मटन रोगन जोश","predicted_qty":25,"unit":"litres"},{"item_name":"दाल मखनी बेस","predicted_qty":45,"unit":"litres"}]', CURRENT_TIMESTAMP()),
      
      -- 2. Malviya Nagar Hub (Jaipur)
      (CURRENT_DATE(), 'kitchen_a', 'outlet_ab', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 38 प्लेट चिकन बिरयानी, 24 लीटर बटर चिकन, 30 लीटर दाल मखनी। सामान्य परिचालन।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":38,"unit":"portions"},{"item_name":"बटर चिकन ग्रेवी","predicted_qty":24,"unit":"litres"},{"item_name":"दाल मखनी बेस","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP()),
      (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_a', 'outlet_ab', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 42 प्लेट चिकन बिरयानी, 26 लीटर बटर चिकन। दोपहर कॉर्पोरेट ऑर्डर्स।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":42,"unit":"portions"},{"item_name":"बटर चिकन ग्रेवी","predicted_qty":26,"unit":"litres"}]', CURRENT_TIMESTAMP()),

      -- 3. Connaught Place Central (Delhi)
      (CURRENT_DATE(), 'kitchen_b', 'outlet_ba', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 55 प्लेट चिकन बिरयानी, 35 लीटर बटर चिकन, 40 लीटर दाल मखनी। सेंट्रल दिल्ली लंच रश।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":55,"unit":"portions"},{"item_name":"बटर चिकन ग्रेवी","predicted_qty":35,"unit":"litres"},{"item_name":"दाल मखनी बेस","predicted_qty":40,"unit":"litres"}]', CURRENT_TIMESTAMP()),
      (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_b', 'outlet_ba', 'dinner', 'hi', 'hi-IN-Neural2-A', 'डिनर: 70 प्लेट चिकन दम बिरयानी, 35 लीटर मटन रोगन जोश। वीकेंड हाई डिमांड।', '', 'वीकेंड हाई डिमांड।', '[{"item_name":"चिकन दम बिरयानी","predicted_qty":70,"unit":"portions"},{"item_name":"मटन रोगन जोश","predicted_qty":35,"unit":"litres"}]', CURRENT_TIMESTAMP()),

      -- 4. Indiranagar Cloud Hub (Bengaluru)
      (CURRENT_DATE(), 'kitchen_c', 'outlet_ca', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 48 प्लेट चिकन बिरयानी, 35 लीटर सांभर, 32 किलो बासमती चावल। टेक हब दोपहर डिलीवरी।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":48,"unit":"portions"},{"item_name":"सांभर सामग्री","predicted_qty":35,"unit":"litres"},{"item_name":"बासमती चावल","predicted_qty":32,"unit":"kg"}]', CURRENT_TIMESTAMP()),
      (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_c', 'outlet_ca', 'breakfast', 'hi', 'hi-IN-Neural2-A', 'नाश्ता: 45 लीटर इडली घोल, 40 लीटर सांभर, 30 लीटर फ़िल्टर कॉफ़ी। मॉर्निंग ब्रेकफास्ट पीक।', '', NULL, '[{"item_name":"इडली घोल","predicted_qty":45,"unit":"litres"},{"item_name":"सांभर सामग्री","predicted_qty":40,"unit":"litres"},{"item_name":"फ़िल्टर कॉफ़ी","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP()),

      -- 5. Bandra West Kitchen (Mumbai)
      (CURRENT_DATE(), 'kitchen_d', 'outlet_da', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 60 प्लेट चिकन दम बिरयानी, 30 लीटर दाल मखनी, 25 प्लेट पनीर टिक्का। मुंबई कोस्टल डिमांड।', '', NULL, '[{"item_name":"चिकन दम बिरयानी","predicted_qty":60,"unit":"portions"},{"item_name":"दाल मखनी बेस","predicted_qty":30,"unit":"litres"},{"item_name":"पनीर टिक्का बेस","predicted_qty":25,"unit":"portions"}]', CURRENT_TIMESTAMP()),
      (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_d', 'outlet_da', 'dinner', 'hi', 'hi-IN-Neural2-A', 'डिनर: 75 प्लेट चिकन दम बिरयानी, 30 लीटर मटन रोगन जोश। लेट-नाइट डिलीवरी स्पाइक।', '', 'लेट-नाइट डिलीवरी स्पाइक।', '[{"item_name":"चिकन दम बिरयानी","predicted_qty":75,"unit":"portions"},{"item_name":"मटन रोगन जोश","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP());
    `;
    await queryBigQuery(insertCacheSql);
    log.push('Created daily_bulletin_cache audio table & pre-populated multi-shift AI bulletins for all 5 outlets');

    return NextResponse.json({
      success: true,
      message: 'BigQuery sample data successfully seeded with full historical shifts across all 5 kitchen outlets!',
      project_id: PROJECT_ID,
      dataset_id: DATASET_ID,
      log
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || String(err),
        log
      },
      { status: 500 }
    );
  }
}
