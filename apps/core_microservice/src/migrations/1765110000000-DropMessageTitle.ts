import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropMessageTitle1765110000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTitle = await queryRunner.hasColumn('messages', 'title');
    if (hasTitle) {
      await queryRunner.query('ALTER TABLE "messages" DROP COLUMN "title"');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTitle = await queryRunner.hasColumn('messages', 'title');
    if (!hasTitle) {
      await queryRunner.query('ALTER TABLE "messages" ADD COLUMN "title" character varying');
    }
  }
}
