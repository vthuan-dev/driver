/**
 * Migration: Add fakeCompletedTrips field to users table
 * Run: node migrate-add-fake-trips.js
 */
const { sequelize } = require('./src/models');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const tableDesc = await qi.describeTable('users');

  const columns = [
    { name: 'fakeCompletedTrips', type: DataTypes.INTEGER, defaultValue: 0 },
  ];

  for (const col of columns) {
    if (!tableDesc[col.name]) {
      await qi.addColumn('users', col.name, {
        type: col.type,
        allowNull: true,
        defaultValue: col.defaultValue,
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
