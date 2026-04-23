module.exports = (sequelize, DataTypes) => {
  const WaitingRequest = sequelize.define('WaitingRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    startPoint: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    endPoint: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    price: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('waiting', 'matched', 'completed'),
      defaultValue: 'waiting'
    },
    region: {
      type: DataTypes.ENUM('north', 'central', 'south'),
      defaultValue: 'north'
    }
  }, {
    tableName: 'waiting_requests',
    timestamps: true
  });

  WaitingRequest.associate = function(models) {
    WaitingRequest.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return WaitingRequest;
};
