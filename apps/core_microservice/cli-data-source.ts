import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  username: process.env.POSTGRES_USER || 'innogram_user',
  password: process.env.POSTGRES_PASSWORD || 'innogram_password',
  database: process.env.POSTGRES_DB || 'innogram',
  entities: [resolve(__dirname, 'src/**/*.entity.{ts,js}')],
  migrations: [resolve(__dirname, 'src/migrations/*.{ts,js}')],
});
