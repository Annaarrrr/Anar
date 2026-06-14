import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
  });

  /**
   * Global ValidationPipe — automatically validates every @Body() against
   * the DTO's class-validator decorators.
   *
   * whitelist: true     — strips properties not defined in the DTO.
   * forbidNonWhitelisted — throws 400 if unknown fields are sent.
   * transform: true     — coerces primitives to their declared TS types.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Allow other microservices / API gateway to call this service.
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['POST'],
  });

  const port = parseInt(process.env.PORT ?? '3004', 10);
  await app.listen(port);

  logger.log(`🚀  ai-bridge-service running on http://localhost:${port}`);
  logger.log(`🔐  Auth: Bearer token required on POST /generate-tasks`);
  logger.log(`🤖  LLM endpoint: ${process.env.LLM_API_URL ?? '(not set — fallback will activate)'}`);
}

bootstrap();