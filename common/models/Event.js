const { DataTypes } = require('sequelize');

const EventModel = {
  event_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  event_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },

  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },

  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'active'
  },

  organizer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
};

module.exports = (sequelize) =>
  sequelize.define('Event', EventModel, {
    tableName: 'events',
    timestamps: false
  });