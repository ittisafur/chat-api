import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat API',
      version,
      description: 'REST API for chat application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            country: { type: 'string' },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'],
};

// User API documentation
export const userSpecs = swaggerJsdoc({
  ...options,
  definition: {
    ...options.definition,
    info: {
      ...options.definition.info,
      title: 'User API',
    },
  },
});

// Admin API documentation
export const adminSpecs = swaggerJsdoc({
  ...options,
  definition: {
    ...options.definition,
    info: {
      ...options.definition.info,
      title: 'Admin API',
    },
  },
});
