const { DataTypes } = require('sequelize');

const UserModel = {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },

  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PARTICIPANT'
  },

  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
};

module.exports = (sequelize) =>
  sequelize.define('User', UserModel, {
    tableName: 'users', //Bu model PostgreSQL’deki users isimli tabloyu kullansın.
    timestamps: false //Sequelize bu tabloya otomatik createdAt ve updatedAt sütunlarını eklemesin.
  });
  // User.js → users tablosunun yapısını tanımlar.
// PostgreSQL → Gerçek kullanıcı kayıtlarının tutulduğu veritabanıdır.
// Sequelize → JavaScript modeli ile PostgreSQL tablosu arasında iletişim kurar.