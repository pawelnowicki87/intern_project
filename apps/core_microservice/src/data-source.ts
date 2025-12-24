import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT ?? 5433),
  username: process.env.POSTGRES_USER ?? 'innogram_user',
  password: process.env.POSTGRES_PASSWORD ?? 'innogram_password',
  database: process.env.POSTGRES_DB ?? 'innogram',

  entities: [join(__dirname, '**/*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations/*.{ts,js}')],

  synchronize: false,
});
