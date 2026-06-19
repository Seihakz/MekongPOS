#!/bin/sh
# ============================================================
# Docker entrypoint — waits for MySQL, creates default users,
# then starts the Express server
# ============================================================

echo "⏳ Waiting for MySQL to be ready..."
until node -e "
  const mysql = require('mysql2/promise');
  mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'pos_system'
  }).then(c => { c.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "   MySQL not ready yet, retrying in 3s..."
  sleep 3
done

echo "✅ MySQL is ready!"

# Create default users if they don't exist
echo "👤 Ensuring default users exist..."
node -e "
  const mysql = require('mysql2/promise');
  const bcrypt = require('bcryptjs');

  (async () => {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'pos_system'
    });

    const adminHash = await bcrypt.hash('admin123', 10);
    const cashierHash = await bcrypt.hash('cashier123', 10);

    await conn.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = username',
      ['admin', adminHash, 'System Admin', 'admin', 'cashier', cashierHash, 'Default Cashier', 'cashier']
    );

    console.log('✅ Default users ready (admin / admin123, cashier / cashier123)');
    await conn.end();
  })().catch(e => { console.error('User creation warning:', e.message); });
"

echo "🚀 Starting MekongPOS server..."
exec node server.js
