const { DataTypes } = require('sequelize');

const CategoryModel = {
  category_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  category_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
};

module.exports = (sequelize) =>
  sequelize.define('Category', CategoryModel, {
    tableName: 'categories',
    timestamps: false
  });