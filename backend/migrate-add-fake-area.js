/**
 * Migration: Add startArea / endArea columns to fake_notifications table
 * Run: node migrate-add-fake-area.js
 */
const { sequelize } = require('./src/models');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const tableDesc = await qi.describeTable('fake_notifications');

  const columns = [
    { name: 'startArea', type: DataTypes.STRING },
    { name: 'endArea', type: DataTypes.STRING },
    { name: 'startDetail', type: DataTypes.STRING },
    { name: 'endDetail', type: DataTypes.STRING },
  ];

  for (const col of columns) {
    if (!tableDesc[col.name]) {
      await qi.addColumn('fake_notifications', col.name, {
        type: col.type,
        allowNull: true,
        defaultValue: null,
      });
      console.log(`✅ Added column: ${col.name}`);
    } else {
      console.log(`⏭️  Column already exists: ${col.name}`);
    }
  }

  console.log('✅ Migration complete');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
