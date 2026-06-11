const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  let connection;

  try {
    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute migration
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📦 Running migration: 001_initial_schema.sql ...');
    await connection.query(migrationSQL);
    console.log('✅ Migration completed');

    // Switch to the database
    await connection.query('USE pos_system');

    // Hash passwords and insert users
    console.log('👤 Inserting users with hashed passwords...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const cashierHash = await bcrypt.hash('cashier123', 10);

    await connection.query(
      `INSERT INTO users (username, password, full_name, role) VALUES
       (?, ?, ?, 'admin'),
       (?, ?, ?, 'cashier')
       ON DUPLICATE KEY UPDATE username=username`,
      ['admin', adminHash, 'System Admin', 'cashier', cashierHash, 'Default Cashier']
    );
    console.log('✅ Users inserted');

    // Read and execute seed data
    const seedPath = path.join(__dirname, '001_seed_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Running seed: 001_seed_data.sql ...');
    await connection.query(seedSQL);
    console.log('✅ Seed data inserted');

    console.log('\n🎉 Database setup complete!');
    console.log('   Database: pos_system');
    console.log('   Admin user: admin / admin123');
    console.log('   Cashier user: cashier / cashier123');

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  Some data already exists, skipping duplicates.');
    } else {
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
};

run();
