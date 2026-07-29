const { DataTypes } = require('sequelize');

const TicketModel = {
  ticket_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  ticket_type: {
    type: DataTypes.STRING,
    allowNull: false
  },

  total_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  available_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

module.exports = (sequelize) =>
  sequelize.define('Ticket', TicketModel, {
    tableName: 'tickets',
    timestamps: false
  });