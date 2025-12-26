import * as path from 'path';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config({
  path: path.resolve(__dirname, '../../../../.env'),
});

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  process.exit(1);
}

const typeormPath = require.resolve('typeorm/cli.js');
const command = `node -r ts-node/register -r tsconfig-paths/register "${typeormPath}" -d src/data-source.ts migration:generate src/migrations/${migrationName}`;

try {
  console.log(`Generating migration: ${migrationName}...`);
  execSync(command, { stdio: 'inherit' });
  console.log('Migration generated successfully');
} catch (error) {
  console.error('Failed to generate migration:', error);
  process.exit(1);
}
