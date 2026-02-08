# API Documentation

This project uses Swagger/OpenAPI for API documentation.

## Accessing the Documentation

Once the server is running, you can access the Swagger UI at:

```
http://localhost:8000/api-docs
```

(Replace `8000` with your actual server port if different)

## Adding Documentation to New Endpoints

To document a new endpoint, add JSDoc comments with Swagger annotations above your route handler. Here's an example:

```typescript
/**
 * @swagger
 * /api/v1/example:
 *   get:
 *     summary: Example endpoint
 *     description: This is an example endpoint
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 */
router.get('/example', exampleHandler);
```

## Swagger Configuration

The Swagger configuration is located in `src/config/swagger.config.ts`. You can modify:

- API information (title, version, description)
- Server URLs
- Security schemes (JWT, API keys, etc.)
- Common schemas
- Tags for grouping endpoints

## Documentation Structure

- **Auth**: Authentication endpoints

## Resources

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)
