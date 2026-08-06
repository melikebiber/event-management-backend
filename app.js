require('dotenv').config();
const express = require('express');
const databaseModule = require('./common/database');

const sequelize =
  databaseModule.default || //database.js dosyasının Sequelize nesnesini farklı biçimlerde dışarı aktarmış olma ihtimallerini kontrol ediyor.
  databaseModule.sequelize ||
  databaseModule; //veritabanı bağlantısını app.js içine aldık.
const defineUser = require('./common/models/User'); //Kullanıcı modelini aldık
const defineCategory = require('./common/models/Category');
const authRoutes = require('./authorization/routes');
const userRoutes = require('./users/routes');
const swaggerSpec = require('./swagger');
const categoryRoutes = require('./categories/routes');
const defineLocation = require('./common/models/Location');
const locationRoutes = require('./locations/routes');
const defineEvent = require('./common/models/Event');
const eventRoutes = require('./events/routes');
const defineTicket = require('./common/models/Ticket')
const ticketRoutes = require('./tickets/routes');
const defineRegistration = require('./common/models/Registration');
const registrationRoutes =require('./registrations/routes');
const cors = require('cors');
const eventRatingRoutes = require('./event-ratings/router');
const defineEventRating = require('./common/models/EventRating');

const app = express();

app.use(cors({ //origin Backend’e hangi frontend adreslerinin erişebileceğini belirler.
  origin: [
    'http://localhost:4200',
    'https://event-management-frontend-beryl-three.vercel.app'
  ]
}));

app.use(express.json()); //İstek gövdesindeki JSON verilerini oku ve req.body içine yerleştir.
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json'); //Cevabın JSON biçiminde olduğunu tarayıcıya bildirir.Content-Type: Cevabın veri türü
  res.send(swaggerSpec);
});

app.get(['/api-docs', '/api-docs/'], (req, res) => {
  res.type('html').send(`
    <!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>Etkinlik Yönetim Sistemi API</title>

        <link
          rel="stylesheet"
          href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
        />
      </head>

      <body>
        <div id="swagger-ui"></div>

        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>

        <script>
          window.onload = function () {
            SwaggerUIBundle({
              url: '/api-docs.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: 'StandaloneLayout'
            });
          };
        </script>
      </body>
    </html>
  `);
});

const databaseReady = sequelize.sync(); //sequelize.sync() tanımlanan Sequelize modellerini veritabanındaki tablolarla eşleştirmeye çalışır.

app.use(async (req, res, next) => { //Fonksiyon içinde await kullanabilmek için fonksiyon async yapılır.
  try {
    await databaseReady; //Veritabanı senkronizasyon işleminin tamamlanmasını bekler.
    next();
  } catch (error) {
    console.error('Veritabanı senkronizasyon hatası:', error);

    res.status(500).json({
      success: false,
      error: 'Veritabanı hazırlanamadı.'
    });
  }
});

// Burada route dosyalarını app.js içine alıyoruz. Route dosyaları, belirli URL yollarına gelen HTTP isteklerini işlemek için kullanılan modüllerdir.
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/locations', locationRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);
app.use('/registrations', registrationRoutes);
app.use('/events', eventRatingRoutes);

//Burada daha önce içeri aldığımız model oluşturma fonksiyonlarına Sequelize bağlantısı veriliyor.
const User = defineUser(sequelize); //sequelize bağlantısını kullanarak User modelini oluştur ve sonucu User değişkenine ata.
const Category = defineCategory(sequelize);
const Location = defineLocation(sequelize);
const Event = defineEvent(sequelize);
const Ticket = defineTicket(sequelize);
const Registration = defineRegistration(sequelize);
const EventRating = defineEventRating(sequelize);

 // Bir kullanıcı birden fazla etkinlik düzenleyebilir.
User.hasMany(Event, { //hasMany:Bir tane User, birçok Event ile ilişkili olabilir.
  foreignKey: 'organizer_id',
  as: 'organizedEvents' // Alias (as) İlişkiye bir takma ad verir.
});

//Bir etkinliğin bir organizatörü vardır.
Event.belongsTo(User, {
  foreignKey: 'organizer_id',
  as: 'organizer'
});

// Bir kategoriye birden fazla etkinlik ait olabilir.
Category.hasMany(Event, {
  foreignKey: 'category_id',
  as: 'events'
});

//Her etkinlik bir kategoriye aittir.
Event.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Bir konumda birden fazla etkinlik düzenlenebilir.
Location.hasMany(Event, {
  foreignKey: 'location_id',
  as: 'events'
});

//Her etkinlik bir konuma aittir.
Event.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location'
});

//Bir etkinliğin birden fazla bilet türü olabilir.
Event.hasMany(Ticket, {
  foreignKey: 'event_id',
  as: 'tickets'
});

//Her bilet türü bir etkinliğe aittir.
Ticket.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});
// Bir kullanıcının birden fazla etkinlik kaydı olabilir
User.hasMany(Registration, {
  foreignKey: 'user_id',
  as: 'registrations'
});

//Her kayıt bir kullanıcıya aittir
Registration.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Bir etkinliğe birden fazla kullanıcı kayıt olabilir
Event.hasMany(Registration, {
  foreignKey: 'event_id',
  as: 'registrations'
});

//Her kayıt belirli bir etkinliğe aittir.
Registration.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

// Bir bilet türü birden fazla kayıtta kullanılabilir
Ticket.hasMany(Registration, {
  foreignKey: 'ticket_id',
  as: 'registrations'
});

//Her kayıt belirli bir bilet türü seçebilir.
Registration.belongsTo(Ticket, {
  foreignKey: 'ticket_id',
  as: 'ticket'
});
// Bir kullanıcının birden fazla etkinlik değerlendirmesi olabilir.
User.hasMany(EventRating, {
  foreignKey: 'user_id',
  as: 'eventRatings'
});

// Her değerlendirme bir kullanıcıya aittir.
EventRating.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Bir etkinliğin birden fazla değerlendirmesi olabilir.
Event.hasMany(EventRating, {
  foreignKey: 'event_id',
  as: 'ratings'
});

// Her değerlendirme bir etkinliğe aittir.
EventRating.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});


/**
 * @swagger
 * /status:
 *   get:
 *     summary: Sunucunun çalışma durumunu kontrol eder
 *     tags:
 *       - Status
 *     responses:
 *       200:
 *         description: Sunucu çalışıyor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

//Bu endpoint sunucunun çalışıp çalışmadığını kontrol etmek için kullanılır.
app.get('/status', (req,res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString() //toISOString() metodu tarihi standart ISO biçimine çevirir.
    });
});
const PORT = process.env.PORT || 3000; //Sunucunun hangi portta çalışacağını belirler.
app.use((err, req, res, next) => {     //process.env, işletim sistemi veya yayın platformu tarafından verilen ortam değişkenlerini içerir.
  console.error(err.stack); //Hatanın mesajını ve oluştuğu kod satırlarını terminale yazdırır.
  res.status(500).json({
    success: false,
    error: 'Something went wrong'
  });
});

//sunucuyu başlatmak için app.listen() fonksiyonunu çağırır. Bu fonksiyon, belirtilen portta gelen HTTP isteklerini dinlemeye başlar.
if (require.main === module) { //app.js doğrudan mı çalıştırıldı, yoksa başka bir dosya tarafından mı içeri aktarıldı?
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
//app nesnesini başka dosyaların kullanabilmesi için dışarı aktarır.
module.exports = app;