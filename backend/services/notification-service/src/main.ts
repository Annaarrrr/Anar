import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Ensure NestJS logger displays all levels including DEBUG during development.
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
  });

  const port = process.env.PORT ?? 3002;
  await app.listen(port);

  logger.log(`🚀 notification-service is running on http://localhost:${port}`);
  logger.log(`🕘 Daily cron is scheduled — check scheduler/daily.cron.ts to toggle test mode.`);
}

bootstrap();