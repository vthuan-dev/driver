module.exports = (sequelize, DataTypes) => {
  const FakeNotification = sequelize.define('FakeNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    region: {
      type: DataTypes.ENUM('north', 'central', 'south'),
      allowNull: false
    },
    startPoint: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [2, 255] }
    },
    endPoint: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [2, 255] }
    },
    displayTime: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    carType: {
      type: DataTypes.ENUM('4', '7', '16'),
      allowNull: false
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: { min: 0 }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id'
      }
    }
  }, {
    tableName: 'fake_notifications',
    timestamps: true,
    indexes: [
      { fields: ['region'] },
      { fields: ['isActive'] },
      { fields: ['region', 'isActive'] }
    ]
  });

  FakeNotification.associate = function(models) {
    FakeNotification.belongsTo(models.Admin, { foreignKey: 'createdById', as: 'createdBy' });
  };

  return FakeNotification;
};
