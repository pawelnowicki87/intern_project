import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserCredencialsToUserCredentials1765372400000 implements MigrationInterface {
  name = 'RenameUserCredencialsToUserCredentials1765372400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasOld = await queryRunner.hasTable('user_credencials');
    const hasNew = await queryRunner.hasTable('user_credentials');
    if (hasOld && !hasNew) {
      await queryRunner.query('ALTER TABLE "user_credencials" RENAME TO "user_credentials"');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasNew = await queryRunner.hasTable('user_credentials');
    const hasOld = await queryRunner.hasTable('user_credencials');
    if (hasNew && !hasOld) {
      await queryRunner.query('ALTER TABLE "user_credentials" RENAME TO "user_credencials"');
    }
  }
}

