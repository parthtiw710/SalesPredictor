/**
 * Direct BigQuery Uploader & Seeder
 * Uses active gcloud session to insert historical data and AI bulletins across all 5 kitchen outlets.
 */
const { execSync } = require('child_process');

const PROJECT_ID = 'bustling-wharf-485615-s9';
const DATASET_ID = 'sales_predictor';

async function getToken() {
  try {
    const token = execSync('gcloud auth print-access-token', {
      encoding: 'utf-8',
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh'
    }).trim();
    return token;
  } catch (err) {
    console.error('Failed to get token from gcloud:', err.message);
    throw err;
  }
}

async function queryBigQuery(token, sql) {
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${PROJECT_ID}/queries`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: sql,
      useLegacySql: false,
      timeoutMs: 90000,
      location: 'US'
    })
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  return data;
}

async function seed() {
  console.log('🔑 Fetching gcloud session token...');
  const token = await getToken();
  console.log('✅ Token acquired successfully! Starting BigQuery data upload to ' + PROJECT_ID + '.' + DATASET_ID + '...\n');

  // Step 0: Ensure Dataset exists
  try {
    console.log('1️⃣ Checking/Creating Dataset...');
    await queryBigQuery(token, `CREATE SCHEMA IF NOT EXISTS \`${PROJECT_ID}.${DATASET_ID}\` OPTIONS (location = 'US');`);
    console.log('   ✓ Dataset ready');
  } catch (e) {
    console.log('   Dataset check:', e.message);
  }

  // Step 1: kitchens_and_outlets
  console.log('2️⃣ Creating & populating master kitchens_and_outlets table...');
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
  await queryBigQuery(token, createOutletsSql);

  await queryBigQuery(token, `DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.kitchens_and_outlets\` WHERE TRUE;`);

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
  await queryBigQuery(token, insertOutletsSql);
  console.log('   ✓ 5 Outlets inserted (Jaipur, Delhi, Bengaluru, Mumbai)');

  // Step 2: restaurant_sales (45 days, 5 outlets, 3 shifts, 15 items => ~3,375 rows)
  console.log('3️⃣ Creating & uploading 45-day historical sales data across all 5 outlets...');
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
  await queryBigQuery(token, createSalesSql);

  try {
    await queryBigQuery(token, `DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.restaurant_sales\` WHERE TRUE;`);
  } catch {}

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
  await queryBigQuery(token, insertSalesSql);
  console.log('   ✓ 45 days × 5 outlets × 15 items (~3,375 records) ingested into restaurant_sales');

  // Step 3: sales_feature_store
  console.log('4️⃣ Building sales_feature_store view for TimesFM and rolling ML models...');
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
  await queryBigQuery(token, createFeatureStoreSql);
  console.log('   ✓ sales_feature_store view created');

  // Step 4: daily_raw_inputs (Mandi receipts)
  console.log('5️⃣ Ingesting Mandi procurement records into daily_raw_inputs...');
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
  await queryBigQuery(token, createRawInputsSql);

  try {
    await queryBigQuery(token, `DELETE FROM \`${PROJECT_ID}.${DATASET_ID}.daily_raw_inputs\` WHERE TRUE;`);
  } catch {}

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
    ('raw_007', CURRENT_TIMESTAMP(), 'kitchen_c', 'outlet_ca', 'GEMINI_OCR', 'यशवंतपुर एपीएमसी मंडी', 'करी पत्ता व इमली', 15, 'kg', 200, 3000, 4650, TRUE),
    ('raw_008', CURRENT_TIMESTAMP(), 'kitchen_d', 'outlet_da', 'GEMINI_OCR', 'वाशी एपीएमसी मार्केट', 'बिरयानी मसाला व खड़ा गरम मसाला', 8, 'kg', 450, 3600, 5600, TRUE),
    ('raw_009', CURRENT_TIMESTAMP(), 'kitchen_d', 'outlet_da', 'GEMINI_OCR', 'वाशी एपीएमसी मार्केट', 'ताजा चिकन ब्रॉयलर', 25, 'kg', 80, 2000, 5600, TRUE);
  `;
  await queryBigQuery(token, insertRawInputsSql);
  console.log('   ✓ Mandi procurement records loaded');

  // Step 5: daily_bulletin_cache (AI generated multi-shift bulletins for each outlet)
  console.log('6️⃣ Creating/Updating daily_bulletin_cache table and inserting AI bulletins for all 5 outlets...');
  try {
    await queryBigQuery(token, `DROP TABLE IF EXISTS \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\`;`);
  } catch (e) {
    console.log('   Drop table warning:', e.message);
  }

  const createCacheSql = `
    CREATE TABLE \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\` (
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
    CLUSTER BY kitchen_id, outlet_id, meal_slot;
  `;
  await queryBigQuery(token, createCacheSql);

  const insertCacheSql = `
    INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\`
    (forecast_date, kitchen_id, outlet_id, meal_slot, lang_code, voice_name, bulletin_text, audio_url, dynamic_reason, items_json, created_at)
    VALUES
    -- 1. Civil Lines Express (Jaipur)
    (CURRENT_DATE(), 'kitchen_a', 'outlet_aa', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच शिफ्ट के लिए तैयारी: 45 प्लेट चिकन बिरयानी, 28 लीटर बटर चिकन ग्रेवी, 35 लीटर दाल मखनी। मौसम धूपदार है, दोपहर 1 बजे डिलीवरी का दबाव रहेगा।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":45,"unit":"portions"},{"item_name":"बटर चिकन ग्रेवी","predicted_qty":28,"unit":"litres"},{"item_name":"दाल मखनी बेस","predicted_qty":35,"unit":"litres"}]', CURRENT_TIMESTAMP()),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_a', 'outlet_aa', 'dinner', 'hi', 'hi-IN-Neural2-A', 'डिनर शिफ्ट तैयारी: 60 प्लेट चिकन दम बिरयानी, 25 लीटर मटन रोगन जोश, 32 प्लेट पनीर टिक्का। वीकेंड पर ऑर्डर्स में 25% बढ़ोतरी का अनुमान है।', '', 'वीकेंड पिक ऑर्डर्स', '[{"item_name":"चिकन दम बिरयानी","predicted_qty":60,"unit":"portions"},{"item_name":"मटन रोगन जोश","predicted_qty":25,"unit":"litres"},{"item_name":"पनीर टिक्का बेस","predicted_qty":32,"unit":"portions"}]', CURRENT_TIMESTAMP()),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 'kitchen_a', 'outlet_aa', 'breakfast', 'hi', 'hi-IN-Neural2-A', 'नाश्ता शिफ्ट: 40 लीटर मसाला चाय बेस, 25 किलो पोहा, 30 लीटर इडली बैटर। ऑफिस जाने वालों की सुबह की रश डिलीवरी।', '', NULL, '[{"item_name":"मसाला चाय बेस","predicted_qty":40,"unit":"litres"},{"item_name":"पोहा बैच","predicted_qty":25,"kg"},{"item_name":"इडली बैटर","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP()),

    -- 2. Malviya Nagar Hub (Jaipur)
    (CURRENT_DATE(), 'kitchen_a', 'outlet_ab', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच तैयारी: 38 प्लेट पनीर बटर मसाला, 25 लीटर दाल मखनी, 22 किलो बासमती चावल। कॉलेज व कोचिंग एरिया में 1:30 बजे पीक ऑर्डर्स अपेक्षित हैं।', '', NULL, '[{"item_name":"पनीर बटर मसाला","predicted_qty":38,"unit":"portions"},{"item_name":"दाल मखनी बेस","predicted_qty":25,"unit":"litres"},{"item_name":"बासमती चावल","predicted_qty":22,"unit":"kg"}]', CURRENT_TIMESTAMP()),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_a', 'outlet_ab', 'dinner', 'hi', 'hi-IN-Neural2-A', 'डिनर तैयारी: 50 प्लेट चिकन बिरयानी, 30 किलो तंदूरी रोटी आटा, 28 प्लेट पनीर टिक्का। छात्र छात्रावासों से रात 9 बजे ऑर्डर्स का दबाव।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":50,"unit":"portions"},{"item_name":"तंदूरी रोटी आटा","predicted_qty":30,"unit":"kg"},{"item_name":"पनीर टिक्का बेस","predicted_qty":28,"unit":"portions"}]', CURRENT_TIMESTAMP()),

    -- 3. Connaught Place Central (Delhi)
    (CURRENT_DATE(), 'kitchen_b', 'outlet_ba', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच तैयारी: 55 प्लेट चिकन बिरयानी, 40 लीटर दाल मखनी, 30 लीटर बटर चिकन। कॉर्पोरेट लंच ऑर्डर्स दोपहर 12:45 से तेजी से बढ़ेंगे।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":55,"unit":"portions"},{"item_name":"दाल मखनी बेस","predicted_qty":40,"unit":"litres"},{"item_name":"बटर चिकन ग्रेवी","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP()),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_b', 'outlet_ba', 'dinner', 'hi', 'hi-IN-Neural2-A', 'डिनर तैयारी: 70 प्लेट चिकन दम बिरयानी, 35 लीटर मटन रोगन जोश। वीकेंड हाई डिमांड।', '', 'वीकेंड हाई डिमांड।', '[{"item_name":"चिकन दम बिरयानी","predicted_qty":70,"unit":"portions"},{"item_name":"मटन रोगन जोश","predicted_qty":35,"unit":"litres"}]', CURRENT_TIMESTAMP()),

    -- 4. Indiranagar Cloud Hub (Bengaluru)
    (CURRENT_DATE(), 'kitchen_c', 'outlet_ca', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 48 प्लेट चिकन बिरयानी, 35 लीटर सांभर, 32 किलो बासमती चावल। टेक हब दोपहर डिलीवरी।', '', NULL, '[{"item_name":"चिकन बिरयानी","predicted_qty":48,"unit":"portions"},{"item_name":"सांभर सामग्री","predicted_qty":35,"unit":"litres"},{"item_name":"बासमती चावल","predicted_qty":32,"unit":"kg"}]', CURRENT_TIMESTAMP()),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_c', 'outlet_ca', 'breakfast', 'hi', 'hi-IN-Neural2-A', 'नाश्ता: 45 लीटर इडली घोल, 40 लीटर सांभर, 30 लीटर फ़िल्टर कॉफ़ी। मॉर्निंग ब्रेकफास्ट पीक।', '', NULL, '[{"item_name":"इडली घोल","predicted_qty":45,"unit":"litres"},{"item_name":"सांभर सामग्री","predicted_qty":40,"unit":"litres"},{"item_name":"फ़िल्टर कॉफ़ी","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP()),

    -- 5. Bandra West Kitchen (Mumbai)
    (CURRENT_DATE(), 'kitchen_d', 'outlet_da', 'lunch', 'hi', 'hi-IN-Neural2-A', 'लंच: 60 प्लेट चिकन दम बिरयानी, 30 लीटर दाल मखनी, 25 प्लेट पनीर टिक्का। मुंबई कोस्टल डिमांड।', '', NULL, '[{"item_name":"चिकन दम बिरयानी","predicted_qty":60,"unit":"portions"},{"item_name":"दाल मखनी बेस","predicted_qty":30,"unit":"litres"},{"item_name":"पनीर टिक्का बेस","predicted_qty":25,"unit":"portions"}]', CURRENT_TIMESTAMP()),
    (DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'kitchen_d', 'outlet_da', 'dinner', 'hi', 'hi-IN-Neural2-A', 'डिनर: 75 प्लेट चिकन दम बिरयानी, 30 लीटर मटन रोगन जोश। लेट-नाइट डिलीवरी स्पाइक।', '', 'लेट-नाइट डिलीवरी स्पाइक।', '[{"item_name":"चिकन दम बिरयानी","predicted_qty":75,"unit":"portions"},{"item_name":"मटन रोगन जोश","predicted_qty":30,"unit":"litres"}]', CURRENT_TIMESTAMP());
  `;
  await queryBigQuery(token, insertCacheSql);
  console.log('   ✓ Multi-shift AI bulletins cached for all 5 outlets');

  // Verify Counts
  console.log('\n📊 Verifying BigQuery Tables and Ingested Row Counts:');
  const counts = await queryBigQuery(token, `
    SELECT 'kitchens_and_outlets' AS tbl, COUNT(*) AS count FROM \`${PROJECT_ID}.${DATASET_ID}.kitchens_and_outlets\`
    UNION ALL
    SELECT 'restaurant_sales', COUNT(*) FROM \`${PROJECT_ID}.${DATASET_ID}.restaurant_sales\`
    UNION ALL
    SELECT 'daily_raw_inputs', COUNT(*) FROM \`${PROJECT_ID}.${DATASET_ID}.daily_raw_inputs\`
    UNION ALL
    SELECT 'daily_bulletin_cache', COUNT(*) FROM \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\`;
  `);

  if (counts.rows) {
    counts.rows.forEach(r => {
      console.log(`   🌟 Table: ${r.f[0].v.padEnd(25)} Rows: ${r.f[1].v}`);
    });
  }

  console.log('\n🎉 ALL BIGQUERY DATA & AI DISPATCH BULLETINS INGESTED SUCCESSFULLY!');
}

seed().catch(err => {
  console.error('\n❌ Seeding failed:', err);
  process.exit(1);
});
