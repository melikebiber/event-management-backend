const express = require('express');
const databaseModule = require('./common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule; //veritabanı bağlantısını app.js içine aldık.
const defineUser = require('./common/models/User'); //Kullanıcı modelini aldık
const defineCategory = require('./common/models/Category');
const authRoutes = require('./authorization/routes');
const userRoutes = require('./users/routes');
const swaggerUi = require('swagger-ui-express');
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

const app = express();

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://event-management-frontend-beryl-three.vercel.app'
  ]
}));

app.use(express.json());
const databaseReady = sequelize.sync();

app.use(async (req, res, next) => {
  try {
    await databaseReady;
    next();
  } catch (error) {
    console.error('Veritabanı senkronizasyon hatası:', error);

    res.status(500).json({
      success: false,
      error: 'Veritabanı hazırlanamadı.'
    });
  }
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/locations', locationRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);
app.use('/registrations', registrationRoutes);

const User = defineUser(sequelize);
const Category = defineCategory(sequelize);
const Location = defineLocation(sequelize);
const Event = defineEvent(sequelize);
const Ticket = defineTicket(sequelize);
const Registration = defineRegistration(sequelize);
 // Bir kullanıcı birden fazla etkinlik düzenleyebilir.
User.hasMany(Event, {
  foreignKey: 'organizer_id',
  as: 'organizedEvents'
});

Event.belongsTo(User, {
  foreignKey: 'organizer_id',
  as: 'organizer'
});

// Bir kategoriye birden fazla etkinlik ait olabilir.
Category.hasMany(Event, {
  foreignKey: 'category_id',
  as: 'events'
});

Event.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Bir konumda birden fazla etkinlik düzenlenebilir.
Location.hasMany(Event, {
  foreignKey: 'location_id',
  as: 'events'
});

Event.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location'
});

Event.hasMany(Ticket, {
  foreignKey: 'event_id',
  as: 'tickets'
});

Ticket.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});
// Bir kullanıcının birden fazla etkinlik kaydı olabilir
User.hasMany(Registration, {
  foreignKey: 'user_id',
  as: 'registrations'
});

Registration.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Bir etkinliğe birden fazla kullanıcı kayıt olabilir
Event.hasMany(Registration, {
  foreignKey: 'event_id',
  as: 'registrations'
});

Registration.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

// Bir bilet türü birden fazla kayıtta kullanılabilir
Ticket.hasMany(Registration, {
  foreignKey: 'ticket_id',
  as: 'registrations'
});

Registration.belongsTo(Ticket, {
  foreignKey: 'ticket_id',
  as: 'ticket'
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
app.get('/status', (req,res) => {
    res.json({
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});
const PORT = process.env.PORT || 3000;
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;