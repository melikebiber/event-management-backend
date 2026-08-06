const { DataTypes } = require('sequelize');

const EventRatingModel = {
  rating_id: {
    type: DataTypes.BIGINT,
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

  content_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },

  organization_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },

  location_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },

  satisfaction_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },

  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
};

module.exports = (sequelize) =>
  sequelize.define('EventRating', EventRatingModel, {
    tableName: 'event_ratings',
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ['user_id', 'event_id']
      }
    ]
  });