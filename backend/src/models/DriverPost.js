module.exports = (sequelize, DataTypes) => {
  const DriverPost = sequelize.define('DriverPost', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    route: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    avatar: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    region: {
      type: DataTypes.ENUM('north', 'central', 'south'),
      defaultValue: 'north'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'driver_posts',
    timestamps: true
  });

  return DriverPost;
};
