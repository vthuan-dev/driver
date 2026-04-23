/**
 * Migration: Add download tracking columns to users table
 * Run: node migrate-add-download-tracking.js
 */
const { sequelize } = require('./src/models');

async function migrate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected!');

    // Check and add appPlan column
    const [planCol] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'appPlan'
    `);
    if (planCol.length === 0) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN appPlan ENUM('6m','1y') NULL DEFAULT NULL AFTER depositBalance`);
      console.log('✅ Added appPlan column');
    } else {
      console.log('⏭️  appPlan already exists');
    }

    // Check and add appDownloadCount column
    const [countCol] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'appDownloadCount'
    `);
    if (countCol.length === 0) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN appDownloadCount INT NOT NULL DEFAULT 0 AFTER appPlan`);
      console.log('✅ Added appDownloadCount column');
    } else {
      console.log('⏭️  appDownloadCount already exists');
    }

    // Check and add appFirstDownloadAt column
    const [timeCol] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'appFirstDownloadAt'
    `);
    if (timeCol.length === 0) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN appFirstDownloadAt DATETIME NULL DEFAULT NULL AFTER appDownloadCount`);
      console.log('✅ Added appFirstDownloadAt column');
    } else {
      console.log('⏭️  appFirstDownloadAt already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
