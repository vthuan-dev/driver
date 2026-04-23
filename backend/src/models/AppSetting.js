module.exports = (sequelize, DataTypes) => {
  const AppSetting = sequelize.define('AppSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    minFakeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      validate: { min: 1 }
    },
    maxFakeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      validate: { min: 1 }
    },
    minFakeInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
      validate: { min: 1 }
    },
    maxFakeInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      validate: { min: 1 }
    }
  }, {
    tableName: 'app_settings',
    timestamps: true
  });

  return AppSetting;
};
