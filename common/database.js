const { Sequelize } = require('sequelize');
const pg = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL ortam değişkeni tanımlı değil.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',

  // Vercel'in pg paketini function içine dahil etmesini sağlar
  dialectModule: pg,

  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },

  pool: {
    max: 3,
    min: 0,
    idle: 10000
  }
});

module.exports = sequelize;