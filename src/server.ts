import 'dotenv/config';
import env from './config/env';
import app from './app';
import http from 'http';
import connectDB from './config/mongodb';
import logger from './common/utils/logger';
import mongoose from 'mongoose';
import { startTokenCleanupJob, stopTokenCleanupJob } from './jobs/token-cleanup.job';

const PORT = env.PORT || 8000;
let server: http.Server | null = null;

// Handles unexpected synchronous errors that were not caught anywhere
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION: SHUTTING DOWN SERVER', err);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    startTokenCleanupJob();

    // Handles rejected Promises that were not handled with catch/try-catch
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION: SHUTTING DOWN SERVER', err);
      if (server) {
        server.close(async () => {
          await mongoose.disconnect();
          stopTokenCleanupJob();
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // Handles graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Shutting down gracefully...');
      if (server) {
        server.close(async () => {
          await mongoose.disconnect();
          stopTokenCleanupJob();
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
