require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test database connection
  await testConnection();

  app.listen(PORT, () => {
    console.log('==========================================');
    console.log(`  🏪 ${process.env.SHOP_NAME || 'MekongPOS'} Server`);
    console.log(`  🚀 Running on http://localhost:${PORT}`);
    console.log(`  📡 API Base: http://localhost:${PORT}/api`);
    console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('==========================================');
  });
};

startServer();
