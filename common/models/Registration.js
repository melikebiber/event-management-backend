const { DataTypes } = require('sequelize');

const RegistrationModel = {
  registration_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  ticket_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  registration_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },

  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'registered'
  }
};

module.exports = (sequelize) =>
  sequelize.define('Registration', RegistrationModel, {
    tableName: 'registrations',
    timestamps: false
  });