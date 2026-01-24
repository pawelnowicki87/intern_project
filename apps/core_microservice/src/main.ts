import 'reflect-metadata';
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    app.enableCors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    app.use(helmet());
    app.use(compression());
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      app.use(
        rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 500,
          standardHeaders: true,
          legacyHeaders: false,
          skip: (req) =>
            req.method === 'GET' ||
            req.path.startsWith('/users/oauth') ||
            req.path.startsWith('/users/auth'),
        }),
      );
    }

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    const config = new DocumentBuilder()
      .setTitle('Innogram Core Microservice')
      .setDescription('API documentation for Core Microservice')
      .setVersion('1.0')
      .addTag('core')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.CORE_PORT ?? 3001;
    await app.listen(port, '0.0.0.0');

    logger.log(`Core Microservice is running on port ${port}`);
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('Fatal error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
