import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Blog API',
    version: '1.0.0',
    description: 'API documentation for the Blog',
    contact: { name: 'API Support' },
  },

  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Current server',
    },
  ],

  security: [{ bearerAuth: [] }],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
    },

    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Error message' },
        },
      },

      Success: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },
  },

  tags: [{ name: 'Auth', description: 'Authentication endpoints' }],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['src/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
