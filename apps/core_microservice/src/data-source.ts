import { config } from 'dotenv';
import { resolve, join } from 'path';
import { DataSource } from 'typeorm';

// 🔧 Wczytaj plik .env z głównego katalogu projektu (intern_project/.env)
config({ path: resolve(__dirname, '../../../.env') });

// Automatyczne rozróżnienie środowiska (lokalne vs Docker)
const isDocker =
  process.env.DOCKER_ENV === 'true' || process.env.POSTGRES_HOST === 'innogram-postgres';

const host = isDocker ? 'innogram-postgres' : process.env.POSTGRES_HOST || 'localhost';

// Konfiguracja bazy danych
export const dataSource = new DataSource({
  type: 'postgres',
  host,
  port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  username: process.env.POSTGRES_USER || 'innogram_user',
  password: process.env.POSTGRES_PASSWORD || 'innogram_password',
  database: process.env.POSTGRES_DB || 'innogram',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false,
  migrationsRun: false,
});
