const { Sequelize } = require('sequelize');
const config = require('./src/config/config');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: 'mysql',
    logging: false
  }
);

async function migrate() {
  try {
    console.log('Adding bank config columns to app_settings...');

    await sequelize.query(`
      ALTER TABLE app_settings
      ADD COLUMN bankCode VARCHAR(20) DEFAULT NULL,
      ADD COLUMN bankName VARCHAR(100) DEFAULT NULL,
      ADD COLUMN accountNo VARCHAR(50) DEFAULT NULL,
      ADD COLUMN accountName VARCHAR(200) DEFAULT NULL
    `);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    if (error.message && error.message.includes('Duplicate column')) {
      console.log('Columns already exist, skipping...');
      process.exit(0);
    }
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
