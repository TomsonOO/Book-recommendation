import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    await app.listen(3000, '0.0.0.0');
  } catch (error) {
    console.error('Error during application bootstrap', error);
    throw error;
  }
}
bootstrap();
