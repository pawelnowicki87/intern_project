import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserCredentialsRefreshNullable1765372200000 implements MigrationInterface {
  name = 'AlterUserCredentialsRefreshNullable1765372200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasOld = await queryRunner.hasTable('user_credencials');
    const hasNew = await queryRunner.hasTable('user_credentials');
    if (hasOld) {
      await queryRunner.query(
        'ALTER TABLE "user_credencials" ALTER COLUMN "refreshtoken_hash" DROP NOT NULL',
      );
    } else if (hasNew) {
      await queryRunner.query(
        'ALTER TABLE "user_credentials" ALTER COLUMN "refreshtoken_hash" DROP NOT NULL',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasNew = await queryRunner.hasTable('user_credentials');
    const hasOld = await queryRunner.hasTable('user_credencials');
    if (hasOld) {
      await queryRunner.query(
        'ALTER TABLE "user_credencials" ALTER COLUMN "refreshtoken_hash" SET NOT NULL',
      );
    } else if (hasNew) {
      await queryRunner.query(
        'ALTER TABLE "user_credentials" ALTER COLUMN "refreshtoken_hash" SET NOT NULL',
      );
    }
  }
}
