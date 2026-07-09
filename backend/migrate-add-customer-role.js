/**
 * Migration: Add role column to users table
 * Run: node migrate-add-customer-role.js
 */
const { sequelize } = require('./src/models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('users');

    if (!tableDescription.role) {
      await queryInterface.addColumn('users', 'role', {
        type: require('sequelize').DataTypes.ENUM('driver', 'customer'),
        defaultValue: 'driver',
        allowNull: false,
        after: 'password'
      });
      console.log('✅ Added role column to users table');
    } else {
      console.log('ℹ️  role column already exists');
    }

    // Make carType and carYear nullable for customer accounts
    await queryInterface.changeColumn('users', 'carType', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('users', 'carYear', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true
    });
    console.log('✅ Made carType and carYear nullable');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
