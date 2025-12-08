import 'tsconfig-paths/register'
import { dataSource } from '../data-source'
import { DropMessageTitle1765110000000 } from '../migrations/1765110000000-DropMessageTitle'

async function run() {
  await dataSource.initialize()
  const queryRunner = dataSource.createQueryRunner()
  await new DropMessageTitle1765110000000().up(queryRunner)
  await dataSource.destroy()
  console.log('Schema updated')
}

run().catch((err) => {
  console.error(err?.message || err)
  process.exit(1)
})
