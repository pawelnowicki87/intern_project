import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationActions1769500000000 implements MigrationInterface {
  name = 'AddNotificationActions1769500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_action_enum') THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'LIKE_POST'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'LIKE_POST';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'LIKE_COMMENT'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'LIKE_COMMENT';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'MESSAGE_RECEIVED'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'MESSAGE_RECEIVED';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'MESSAGE_GROUP_RECEIVED'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'MESSAGE_GROUP_RECEIVED';
          END IF;
        END IF;
      END
      $$;
    `);
  }

  public async down(_: QueryRunner): Promise<void> {
    // No safe down migration: Postgres does not support removing enum values easily.
  }
}
