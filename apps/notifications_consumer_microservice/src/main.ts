import 'reflect-metadata';
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(3003);
    console.log('Notifications consumer running on http://localhost:3003');
  } catch (err) {
    console.error('Failed to start notifications consumer:', err);
    process.exit(1);
  }
}
bootstrap();
