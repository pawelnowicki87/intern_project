import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatName1768652603382 implements MigrationInterface {
  name = 'AddChatName1768652603382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "chats" ADD "name" character varying(100)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "chats" DROP COLUMN "name"');
  }

}
