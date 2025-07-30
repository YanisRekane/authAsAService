const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ASAS Auth API',
      version: '1.0.0',
      description: 'Authentication microservice for ASAS',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/usersRoutes.js','./routes/mainRoutes.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;