//backend ile PostgreSQL veritabanı arasında Sequelize bağlantısını oluşturmak 
// ve bu bağlantıyı diğer dosyaların kullanımına vermektir.

const { Sequelize } = require('sequelize');
const pg = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL ortam değişkeni tanımlı değil.');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',

  // Vercel'in pg paketini function içine dahil etmesini sağlar
  dialectModule: pg,

  logging: false, //sorguları terminalde görmememizi sağlar.

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },

  pool: {
    max: 3, //Havuzda aynı anda en fazla 3 veritabanı bağlantısı bulunabilir.
    min: 0, //Kullanılmıyorsa açık bağlantı tutmak zorunda değilsin.
    idle: 10000 //Bir bağlantı 10 saniye boyunca boşta kalırsa havuzdan kapatılabilir.
  }
});

module.exports = sequelize;