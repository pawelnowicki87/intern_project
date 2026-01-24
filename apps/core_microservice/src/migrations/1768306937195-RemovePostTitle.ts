import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePostTitle1768306937195 implements MigrationInterface {
  name = 'RemovePostTitle1768306937195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "posts" DROP COLUMN "title"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "posts" ADD "title" character varying');
  }

}
