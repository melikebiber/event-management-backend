const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
   info: {
  title: 'Event Management API',
  version: '1.0.0',
  description: 'Etkinlik yönetim sistemi backend API dokümantasyonu'
},
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
 apis: [
  './authorization/routes.js',
  './users/routes.js',
  './categories/routes.js',
  './locations/routes.js',
  './events/routes.js',
  './tickets/routes.js',
  './registrations/routes.js',
  './app.js',
  './event-ratings/*.js'
  
]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;