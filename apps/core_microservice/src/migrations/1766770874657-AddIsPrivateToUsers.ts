import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsPrivateToUsers1766770874657 implements MigrationInterface {
    name = 'AddIsPrivateToUsers1766770874657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credentials" DROP CONSTRAINT "FK_1553d4b96cfb514c832234a6a67"`);
        await queryRunner.query(`ALTER TABLE "mentions" DROP CONSTRAINT "FK_mentions_mentioned"`);
        await queryRunner.query(`ALTER TABLE "mentions" DROP CONSTRAINT "FK_mentions_created_by"`);
        await queryRunner.query(`CREATE TABLE "likes_comments" ("user_id" integer NOT NULL, "comment_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd9342e8385295a0b4557c5d548" PRIMARY KEY ("user_id", "comment_id"))`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "parent_id" integer`);
        await queryRunner.query(`CREATE TYPE "public"."follows_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "follows" ADD "status" "public"."follows_status_enum" NOT NULL DEFAULT 'accepted'`);
        await queryRunner.query(`ALTER TABLE "follows" ADD "approved_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "follows" ADD "rejected_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_private" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "user_credentials_id_seq" OWNED BY "user_credentials"."id"`);
        await queryRunner.query(`ALTER TABLE "user_credentials" ALTER COLUMN "id" SET DEFAULT nextval('"user_credentials_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "user_credentials" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "user_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "likes_comments" ADD CONSTRAINT "FK_7308db24de1e49ec93489eece53" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "likes_comments" ADD CONSTRAINT "FK_094a34ab526c9617cf7c261c15e" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_d6f93329801a93536da4241e386" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_credentials" ADD CONSTRAINT "FK_dd0918407944553611bb3eb3ddc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mentions" ADD CONSTRAINT "FK_1901d04a1e2de8e831fc107fe3e" FOREIGN KEY ("mentioned_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mentions" ADD CONSTRAINT "FK_0079a5f320f8f8cfc704ae01847" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mentions" DROP CONSTRAINT "FK_0079a5f320f8f8cfc704ae01847"`);
        await queryRunner.query(`ALTER TABLE "mentions" DROP CONSTRAINT "FK_1901d04a1e2de8e831fc107fe3e"`);
        await queryRunner.query(`ALTER TABLE "user_credentials" DROP CONSTRAINT "FK_dd0918407944553611bb3eb3ddc"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_d6f93329801a93536da4241e386"`);
        await queryRunner.query(`ALTER TABLE "likes_comments" DROP CONSTRAINT "FK_094a34ab526c9617cf7c261c15e"`);
        await queryRunner.query(`ALTER TABLE "likes_comments" DROP CONSTRAINT "FK_7308db24de1e49ec93489eece53"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "user_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credentials" ALTER COLUMN "id" SET DEFAULT nextval('user_credencials_id_seq')`);
        await queryRunner.query(`ALTER TABLE "user_credentials" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "user_credentials_id_seq"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_private"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "rejected_at"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "approved_at"`);
        await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."follows_status_enum"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "parent_id"`);
        await queryRunner.query(`DROP TABLE "likes_comments"`);
        await queryRunner.query(`ALTER TABLE "mentions" ADD CONSTRAINT "FK_mentions_created_by" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mentions" ADD CONSTRAINT "FK_mentions_mentioned" FOREIGN KEY ("mentioned_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_credentials" ADD CONSTRAINT "FK_1553d4b96cfb514c832234a6a67" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
