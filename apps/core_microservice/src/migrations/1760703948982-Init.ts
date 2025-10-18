import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1760703948982 implements MigrationInterface {
  name = 'Init1760703948982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "likes_comments" ("user_id" integer NOT NULL, "comment_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bd9342e8385295a0b4557c5d548" PRIMARY KEY ("user_id", "comment_id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "files" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "type" character varying, "owner_id" integer NOT NULL, "comment_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "comments" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "post_id" integer NOT NULL, "body" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "likes_posts" ("user_id" integer NOT NULL, "post_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b5807b18fd3ade1691f633fb4f5" PRIMARY KEY ("user_id", "post_id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "post_assets" ("post_id" integer NOT NULL, "file_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_98bf2355b6e999152f8f89f1d07" PRIMARY KEY ("post_id", "file_id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "posts" ("id" SERIAL NOT NULL, "title" character varying, "body" text, "user_id" integer NOT NULL, "status" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "follows" ("follower_id" integer NOT NULL, "followed_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b6aa74193794c7c5d09e7423c7f" PRIMARY KEY ("follower_id", "followed_id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "message_assets" ("message_id" integer NOT NULL, "file_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4ba4c9c6764854c6873817d3438" PRIMARY KEY ("message_id", "file_id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "messages" ("id" SERIAL NOT NULL, "sender_id" integer NOT NULL, "receiver_id" integer NOT NULL, "title" character varying, "body" text, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "recipient_id" integer NOT NULL, "sender_id" integer NOT NULL, "action" character varying NOT NULL, "target_id" integer NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "users" ("id" SERIAL NOT NULL, "first_name" character varying, "last_name" character varying, "email" character varying NOT NULL, "phone" character varying(20), "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "profile_to_profile_configurations" ("source_user_id" integer NOT NULL, "target_user_id" integer NOT NULL, "is_blocked" boolean NOT NULL DEFAULT false, "is_muted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f823cdde24dc9c5e07597276c9b" PRIMARY KEY ("source_user_id", "target_user_id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "chat_participants" ("chat_id" integer NOT NULL, "user_id" integer NOT NULL, "joined_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_36c99e4a017767179cc49d0ac74" PRIMARY KEY ("chat_id", "user_id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "chats" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'ALTER TABLE "likes_comments" ADD CONSTRAINT "FK_7308db24de1e49ec93489eece53" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "likes_comments" ADD CONSTRAINT "FK_094a34ab526c9617cf7c261c15e" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "files" ADD CONSTRAINT "FK_4bc1db1f4f34ec9415acd88afdb" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "files" ADD CONSTRAINT "FK_db7b86afe40dda812511f3dc91c" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "likes_posts" ADD CONSTRAINT "FK_5eca95fe513d96a0c7727ea4ad5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "likes_posts" ADD CONSTRAINT "FK_ce551716fa81636c9befe526391" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "post_assets" ADD CONSTRAINT "FK_ae3495fdc7a04ae0a3ed29c0370" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "post_assets" ADD CONSTRAINT "FK_c0439145e0f00318ff821d6b8d3" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "follows" ADD CONSTRAINT "FK_54b5dc2739f2dea57900933db66" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "follows" ADD CONSTRAINT "FK_48e534a8c1b29ca3a81e8d112b7" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "message_assets" ADD CONSTRAINT "FK_11ed3d5b2dfbc265705fff99938" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "message_assets" ADD CONSTRAINT "FK_56033d9e3fee6f7712c0b06dee5" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "messages" ADD CONSTRAINT "FK_b561864743d235f44e70addc1f5" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "notifications" ADD CONSTRAINT "FK_5332a4daa46fd3f4e6625dd275d" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "notifications" ADD CONSTRAINT "FK_4140c8b09ff58165daffbefbd7e" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "profile_to_profile_configurations" ADD CONSTRAINT "FK_0b913556f1b644a67dc48428609" FOREIGN KEY ("source_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "profile_to_profile_configurations" ADD CONSTRAINT "FK_efe2aa9fe124ab394d1bb540c7c" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "chat_participants" ADD CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "chat_participants" ADD CONSTRAINT "FK_b4129b3e21906ca57b503a1d834" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "chat_participants" DROP CONSTRAINT "FK_b4129b3e21906ca57b503a1d834"',
    );
    await queryRunner.query(
      'ALTER TABLE "chat_participants" DROP CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545"',
    );
    await queryRunner.query(
      'ALTER TABLE "profile_to_profile_configurations" DROP CONSTRAINT "FK_efe2aa9fe124ab394d1bb540c7c"',
    );
    await queryRunner.query(
      'ALTER TABLE "profile_to_profile_configurations" DROP CONSTRAINT "FK_0b913556f1b644a67dc48428609"',
    );
    await queryRunner.query(
      'ALTER TABLE "notifications" DROP CONSTRAINT "FK_4140c8b09ff58165daffbefbd7e"',
    );
    await queryRunner.query(
      'ALTER TABLE "notifications" DROP CONSTRAINT "FK_5332a4daa46fd3f4e6625dd275d"',
    );
    await queryRunner.query(
      'ALTER TABLE "messages" DROP CONSTRAINT "FK_b561864743d235f44e70addc1f5"',
    );
    await queryRunner.query(
      'ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"',
    );
    await queryRunner.query(
      'ALTER TABLE "message_assets" DROP CONSTRAINT "FK_56033d9e3fee6f7712c0b06dee5"',
    );
    await queryRunner.query(
      'ALTER TABLE "message_assets" DROP CONSTRAINT "FK_11ed3d5b2dfbc265705fff99938"',
    );
    await queryRunner.query(
      'ALTER TABLE "follows" DROP CONSTRAINT "FK_48e534a8c1b29ca3a81e8d112b7"',
    );
    await queryRunner.query(
      'ALTER TABLE "follows" DROP CONSTRAINT "FK_54b5dc2739f2dea57900933db66"',
    );
    await queryRunner.query('ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"');
    await queryRunner.query(
      'ALTER TABLE "post_assets" DROP CONSTRAINT "FK_c0439145e0f00318ff821d6b8d3"',
    );
    await queryRunner.query(
      'ALTER TABLE "post_assets" DROP CONSTRAINT "FK_ae3495fdc7a04ae0a3ed29c0370"',
    );
    await queryRunner.query(
      'ALTER TABLE "likes_posts" DROP CONSTRAINT "FK_ce551716fa81636c9befe526391"',
    );
    await queryRunner.query(
      'ALTER TABLE "likes_posts" DROP CONSTRAINT "FK_5eca95fe513d96a0c7727ea4ad5"',
    );
    await queryRunner.query(
      'ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"',
    );
    await queryRunner.query(
      'ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"',
    );
    await queryRunner.query('ALTER TABLE "files" DROP CONSTRAINT "FK_db7b86afe40dda812511f3dc91c"');
    await queryRunner.query('ALTER TABLE "files" DROP CONSTRAINT "FK_4bc1db1f4f34ec9415acd88afdb"');
    await queryRunner.query(
      'ALTER TABLE "likes_comments" DROP CONSTRAINT "FK_094a34ab526c9617cf7c261c15e"',
    );
    await queryRunner.query(
      'ALTER TABLE "likes_comments" DROP CONSTRAINT "FK_7308db24de1e49ec93489eece53"',
    );
    await queryRunner.query('DROP TABLE "chats"');
    await queryRunner.query('DROP TABLE "chat_participants"');
    await queryRunner.query('DROP TABLE "profile_to_profile_configurations"');
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TABLE "notifications"');
    await queryRunner.query('DROP TABLE "messages"');
    await queryRunner.query('DROP TABLE "message_assets"');
    await queryRunner.query('DROP TABLE "follows"');
    await queryRunner.query('DROP TABLE "posts"');
    await queryRunner.query('DROP TABLE "post_assets"');
    await queryRunner.query('DROP TABLE "likes_posts"');
    await queryRunner.query('DROP TABLE "comments"');
    await queryRunner.query('DROP TABLE "files"');
    await queryRunner.query('DROP TABLE "likes_comments"');
  }
}
