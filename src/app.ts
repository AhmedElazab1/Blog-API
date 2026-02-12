// Node modules
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import env from './config/env';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import passport from 'passport';

// Custom modules
import limiter from './config/limiter';
import router from './routes';
import { notFound } from './common/middlewares/notFound';
import errorHandler from './common/errors/errorHandler';

// Types
import './common/Interfaces/types';
import { CorsOptions } from 'cors';

const app = express();

const logStream = fs.createWriteStream(path.join(process.cwd(), 'logs', 'api.log'), {
  flags: 'a',
});

const corsOptions: CorsOptions = {
  origin: 'http://localhost:8000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(compression({ threshold: 1024 }));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors(corsOptions));
app.use(limiter);
app.use(passport.initialize());

// Compatibility middleware for express-mongo-sanitize with Express 5
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach((prop) => {
    const value = (req as any)[prop];
    Object.defineProperty(req, prop, {
      value: value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  });
  next();
});

app.use(mongoSanitize());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny', { stream: logStream }));
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Simple hello world endpoint
 *     security: []
 *     responses:
 *       200:
 *         description: Hello World message
 */
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation',
  }),
);

app.use('/api/v1', router);
app.use(notFound);
app.use(errorHandler);

export default app;
