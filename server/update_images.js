const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\c51116b1-e82e-4982-bf7a-e2f2bab7bf94';
const uploadsDir = path.join(__dirname, 'uploads', 'products');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Map of image prefix to product barcode (from seed data)
const imageToBarcodeMap = {
  'coca_cola': '8850999220017',
  'pepsi': '8851234560012',
  'mineral_water': '8850001234567',
  'orange_juice': '8850009876543',
  'iced_coffee': '8851111222333',
  'lays_classic': '8852222333444',
  'oreo_cookies': '8852223334445',
  'kitkat': '8852224335446',
  'snickers': '8853333444555',
  'usbc_cable': '8854444555666',
  'earphones': '8854445556667',
  'phone_charger': '8854446557668',
  'dish_soap': '8855555666777',
  'tissue_box': '8855556667778',
  'ballpoint_pen': '8856666777888',
  'notebook_a5': '8856667778889'
};

async function updateImages() {
require('dotenv').config();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pos_system'
  });

  const files = fs.readdirSync(artifactDir);

  for (const [prefix, barcode] of Object.entries(imageToBarcodeMap)) {
    // Find the latest image for this prefix
    const matchingFiles = files.filter(f => f.startsWith(prefix + '_') && f.endsWith('.png'));
    if (matchingFiles.length === 0) continue;
    
    // Sort by timestamp if multiple, grab the last one
    matchingFiles.sort();
    const latestFile = matchingFiles[matchingFiles.length - 1];
    
    const sourcePath = path.join(artifactDir, latestFile);
    // Standardize the target name
    const targetName = `${prefix}.png`;
    const targetPath = path.join(uploadsDir, targetName);
    
    // Copy file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${latestFile} to ${targetName}`);
    
    // Update DB
    const imageUrl = `/uploads/products/${targetName}`;
    await db.query('UPDATE products SET image_url = ? WHERE barcode = ?', [imageUrl, barcode]);
    console.log(`Updated DB for barcode ${barcode}`);
  }

  await db.end();
  console.log('All images updated successfully!');
}

updateImages().catch(console.error);
