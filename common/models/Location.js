const { DataTypes } = require('sequelize');

const LocationModel = {
  location_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  location_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  city: {
    type: DataTypes.STRING,
    allowNull: true
  },

  district: {
    type: DataTypes.STRING,
    allowNull: true
  },

  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
};

module.exports = (sequelize) =>
  sequelize.define('Location', LocationModel, {
    tableName: 'locations',
    timestamps: false
  });