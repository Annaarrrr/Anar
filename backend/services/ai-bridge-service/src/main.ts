import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Port 3006 avoids conflicts with the 3004 Python AI service
  await app.listen(3006);
  console.log(`AI Bridge Service is running on port 3006`);
}
bootstrap();