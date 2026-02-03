import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBioAndAvatarToUsers1767610953846 implements MigrationInterface {
  name = 'AddBioAndAvatarToUsers1767610953846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('users', 'website')) {
      await queryRunner.query('ALTER TABLE "users" DROP COLUMN "website"');
    }
    if (await queryRunner.hasColumn('users', 'avatar')) {
      await queryRunner.query('ALTER TABLE "users" DROP COLUMN "avatar"');
    }
    if (!(await queryRunner.hasColumn('users', 'avatar_url'))) {
      await queryRunner.query('ALTER TABLE "users" ADD "avatar_url" character varying(255)');
    }
    if (await queryRunner.hasColumn('users', 'bio')) {
      await queryRunner.query('ALTER TABLE "users" DROP COLUMN "bio"');
    }
    await queryRunner.query('ALTER TABLE "users" ADD "bio" text');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "bio"');
    await queryRunner.query('ALTER TABLE "users" ADD "bio" character varying(255)');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "avatar_url"');
    await queryRunner.query('ALTER TABLE "users" ADD "avatar" character varying(255)');
    await queryRunner.query('ALTER TABLE "users" ADD "website" character varying(255)');
  }

}
