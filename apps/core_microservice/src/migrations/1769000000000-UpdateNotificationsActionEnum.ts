import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationsActionEnum1769000000000 implements MigrationInterface {
  name = 'UpdateNotificationsActionEnum1769000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_action_enum') THEN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'FOLLOW_REQUEST'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'FOLLOW_REQUEST';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'FOLLOW_ACCEPTED'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'FOLLOW_ACCEPTED';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'FOLLOW_REJECTED'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'FOLLOW_REJECTED';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'MENTION_COMMENT'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'MENTION_COMMENT';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'MENTION_POST'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'MENTION_POST';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'COMMENT_POST'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'COMMENT_POST';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'notifications_action_enum' AND e.enumlabel = 'COMMENT_REPLY'
          ) THEN
            ALTER TYPE "public"."notifications_action_enum" ADD VALUE 'COMMENT_REPLY';
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
