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
    tableName: 'users',
    timestamps: false
  });
  //User.js sadece “kullanıcı verisi nasıl tutulacak?” sorusunun cevabı. //User.js → Kullanıcı tablosunun planı/projesi // data.db → Gerçek veritabanı dosyası // Sequelize → Bu ikisi arasında bağlantı kuran araç eski hali böyleydi