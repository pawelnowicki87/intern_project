import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserCredentialsId1766771110624 implements MigrationInterface {
  name = 'FixUserCredentialsId1766771110624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SEQUENCE IF NOT EXISTS "user_credentials_id_seq" OWNED BY "user_credentials"."id"');
    await queryRunner.query('ALTER TABLE "user_credentials" ALTER COLUMN "id" SET DEFAULT nextval(\'"user_credentials_id_seq"\')');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user_credentials" ALTER COLUMN "id" DROP DEFAULT');
    await queryRunner.query('DROP SEQUENCE "user_credentials_id_seq"');
  }

}
