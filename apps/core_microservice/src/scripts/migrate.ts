import 'tsconfig-paths/register'
import { dataSource } from '../data-source'
import { AddMentionsAndUsername1765016767842 } from '../migrations/1765016767842-AddMentionsAndUsername'

async function run() {
  await dataSource.initialize()
  const queryRunner = dataSource.createQueryRunner()
  await new AddMentionsAndUsername1765016767842().up(queryRunner)
  await dataSource.destroy()
  console.log('Schema updated')
}

run().catch((err) => {
  console.error(err?.message || err)
  process.exit(1)
})
