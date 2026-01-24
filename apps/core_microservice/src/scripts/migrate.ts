import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../../../.env'),
});

import 'tsconfig-paths/register';
import dataSource from '../data-source';

async function run() {
  console.log('Loaded DB config:', {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    db: process.env.POSTGRES_DB,
  });

  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();

  console.log('Schema updated');
}

run().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
