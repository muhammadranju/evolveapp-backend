import colors from 'colors';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './DB/seedAdmin';
import { errorLogger, logger } from './shared/logger';
import cron from 'node-cron';
import {
  resetNotificationsWeekly,
  sendWeeklyNotifications,
} from './util/notification/pushNotifcation';
// Handle uncaught exceptions
process.on('uncaughtException', error => {
  errorLogger.error('Uncaught Exception Detected', error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));

    // Seed Super Admin after DB connection
    await seedSuperAdmin();

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    // Start Express server
    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port: ${config.port}`)
      );
    });
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect to Database'), error);
  }
  // ---------------- AUTOMATIC CRON JOBS ----------------

  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    await sendWeeklyNotifications();
  });

  // Reset notifications every Sunday at 00:00 for the next week
  cron.schedule('0 0 * * 0', async () => {
    await resetNotificationsWeekly();
  });
  // Handle unhandled promise rejections
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('Unhandled Rejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

// Run main
main();

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close();
  }
});
