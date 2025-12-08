import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(cookieParser());

  // Enable CORS for frontend app
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  // Enable global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unexpected fields
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global error mapping for domain errors
  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = process.env.AUTH_PORT || 3002;
  await app.listen(PORT, '0.0.0.0');

  console.log('Auth_microservice is running on port', PORT);
}

bootstrap();
