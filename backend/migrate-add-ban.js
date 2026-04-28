/**
 * Migration: Add ban columns to users table
 * Run: node migrate-add-ban.js
 */
const { sequelize } = require('./src/models');

async function migrate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected!');

    // Check and add isBanned column
    const [bannedCol] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'isBanned'
    `);
    if (bannedCol.length === 0) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN isBanned TINYINT(1) NOT NULL DEFAULT 0`);
      console.log('✅ Added isBanned column');
    } else {
      console.log('⏭️  isBanned already exists');
    }

    // Check and add banReason column
    const [reasonCol] = await sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'banReason'
    `);
    if (reasonCol.length === 0) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN banReason VARCHAR(500) NULL DEFAULT NULL`);
      console.log('✅ Added banReason column');
    } else {
      console.log('⏭️  banReason already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
