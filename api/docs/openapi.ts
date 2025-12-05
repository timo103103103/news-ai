import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'News Analysis API',
      version: '1.0.0',
      description: 'REST API for analytical processes and results',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/analyze/summary': {
        post: {
          summary: 'Generate summary',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    fileUrl: { type: 'string', nullable: true },
                    params: { type: 'object', additionalProperties: true },
                  },
                  required: ['text'],
                },
              },
            },
          },
          responses: {
            '200': { description: 'OK' },
            '400': { description: 'Bad Request' },
          },
        },
      },
      '/analysis': {
        post: {
          summary: 'Create analysis job',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    text: { type: 'string' },
                    fileUrl: { type: 'string', nullable: true },
                    params: { type: 'object', additionalProperties: true },
                  },
                  required: ['type'],
                },
              },
            },
          },
          responses: { '202': { description: 'Accepted' } },
        },
        get: {
          summary: 'List analysis history',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/analysis/{id}': {
        get: {
          summary: 'Get analysis result',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } },
        },
      },
      '/analysis/{id}/status': {
        get: {
          summary: 'Get analysis status',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } },
        },
      },
    },
  },
  apis: [],
}

export const swaggerSpec = swaggerJSDoc(options)