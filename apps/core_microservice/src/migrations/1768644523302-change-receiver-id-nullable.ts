import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeReceiverIdNullable1768644523302 implements MigrationInterface {
    name = 'ChangeReceiverIdNullable1768644523302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_posts" DROP CONSTRAINT "fk_saved_posts_post"`);
        await queryRunner.query(`ALTER TABLE "saved_posts" DROP CONSTRAINT "fk_saved_posts_user"`);
        await queryRunner.query(`ALTER TABLE "saved_posts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "saved_posts" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_b561864743d235f44e70addc1f5"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "receiver_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "saved_posts" ADD CONSTRAINT "FK_78c961371a509e86d789714dd4f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_posts" ADD CONSTRAINT "FK_116e9df57f5221cc1a77c3d1cfe" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_b561864743d235f44e70addc1f5" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_b561864743d235f44e70addc1f5"`);
        await queryRunner.query(`ALTER TABLE "saved_posts" DROP CONSTRAINT "FK_116e9df57f5221cc1a77c3d1cfe"`);
        await queryRunner.query(`ALTER TABLE "saved_posts" DROP CONSTRAINT "FK_78c961371a509e86d789714dd4f"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "receiver_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_b561864743d235f44e70addc1f5" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_posts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "saved_posts" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "saved_posts" ADD CONSTRAINT "fk_saved_posts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_posts" ADD CONSTRAINT "fk_saved_posts_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
