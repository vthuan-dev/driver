/**
 * Migration: Add fake income fields to users table
 * Run: node migrate-add-fake-income.js
 */
const { sequelize } = require('./src/models');
const { QueryInterface, DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const tableDesc = await qi.describeTable('users');

  const columns = [
    { name: 'fakeIncomeAmount', type: DataTypes.BIGINT, defaultValue: 0 },
    { name: 'fakeIncomeTips', type: DataTypes.BIGINT, defaultValue: 0 },
    { name: 'fakeIncomeHistory', type: DataTypes.TEXT('long'), defaultValue: null },
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
