import 'dotenv/config';
import 'tsconfig-paths/register';
import dataSource from '../data-source';

async function run() {
  await dataSource.initialize();
  await dataSource.undoLastMigration();
  await dataSource.destroy();

  console.log('Last migration reverted');
}

run().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
