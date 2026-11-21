/**
 * Direct BigQuery & AI Seeder Script
 * Seeds historical data for all 5 kitchen outlets and pre-triggers AI bulletin synthesis.
 */
const http = require('http');

async function triggerLocalSeed() {
  console.log('🚀 Triggering BigQuery Data Ingestion & AI Synthesis via /api/seed...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/seed',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('✅ Seeder Response Status:', res.statusCode);
        console.log('📊 Result:', JSON.stringify(json, null, 2));
      } catch {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('ℹ️  Next.js local server is not currently running on port 3000.');
    console.log('👉 Start the dev server with "npm run dev", then open http://localhost:3000/api/seed to trigger full BigQuery seeding.');
  });

  req.end();
}

triggerLocalSeed();
