import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Global .env configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
    }),

    // HTTP Client setup — communication with Core Microservice
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('CORE_SERVICE_URL') || 'http://localhost:3001',
        timeout: 5000,
        maxRedirects: 3,
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    AuthModule,
  ],
})
export class AppModule {}
