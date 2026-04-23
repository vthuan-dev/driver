/**
 * Migration: Add 'note' column to fake_notifications table
 * Run: node migrate-add-note.js
 */
const { sequelize } = require('./src/models');

async function migrate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected!');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'fake_notifications' 
        AND COLUMN_NAME = 'note'
    `);

    if (results.length > 0) {
      console.log('Column "note" already exists. Skipping migration.');
      process.exit(0);
    }

    // Add the column
    await sequelize.query(`
      ALTER TABLE fake_notifications 
      ADD COLUMN note TEXT NULL DEFAULT NULL 
      AFTER price
    `);

    console.log('✅ Migration successful: Added "note" column to fake_notifications table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
