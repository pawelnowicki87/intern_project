import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMentionsAndUsername1765016767842 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsername = await queryRunner.hasColumn('users', 'user_name');
    if (!hasUsername) {
      await queryRunner.query('ALTER TABLE "users" ADD COLUMN "user_name" character varying');
      await queryRunner.query('ALTER TABLE "users" ADD CONSTRAINT "UQ_users_user_name" UNIQUE ("user_name")');
    }

    const hasPasswordHash = await queryRunner.hasColumn('users', 'password_hash');
    if (hasPasswordHash) {
      await queryRunner.query('ALTER TABLE "users" DROP COLUMN "password_hash"');
    }

    const hasMentions = await queryRunner.hasTable('mentions');
    if (!hasMentions) {
      await queryRunner.query('DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = \'mentions_source_type_enum\') THEN CREATE TYPE "public"."mentions_source_type_enum" AS ENUM(\'COMMENT\', \'POST\'); END IF; END $$;');
      await queryRunner.query('CREATE TABLE "mentions" ("id" SERIAL NOT NULL, "source_id" integer NOT NULL, "source_type" "public"."mentions_source_type_enum" NOT NULL, "mentioned_user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_user_id" integer NOT NULL, CONSTRAINT "PK_mentions_id" PRIMARY KEY ("id"))');
      await queryRunner.query('ALTER TABLE "mentions" ADD CONSTRAINT "FK_mentions_mentioned" FOREIGN KEY ("mentioned_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
      await queryRunner.query('ALTER TABLE "mentions" ADD CONSTRAINT "FK_mentions_created_by" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMentions = await queryRunner.hasTable('mentions');
    if (hasMentions) {
      await queryRunner.query('ALTER TABLE "mentions" DROP CONSTRAINT "FK_mentions_created_by"');
      await queryRunner.query('ALTER TABLE "mentions" DROP CONSTRAINT "FK_mentions_mentioned"');
      await queryRunner.query('DROP TABLE "mentions"');
      await queryRunner.query('DROP TYPE IF EXISTS "public"."mentions_source_type_enum"');
    }

    const hasUsername = await queryRunner.hasColumn('users', 'user_name');
    if (hasUsername) {
      await queryRunner.query('ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_user_name"');
      await queryRunner.query('ALTER TABLE "users" DROP COLUMN "user_name"');
    }

    const hasPasswordHash = await queryRunner.hasColumn('users', 'password_hash');
    if (!hasPasswordHash) {
      await queryRunner.query('ALTER TABLE "users" ADD COLUMN "password_hash" character varying NOT NULL');
    }
  }

}
