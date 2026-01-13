import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSavedPosts1768340800000 implements MigrationInterface {
  name = 'CreateSavedPosts1768340800000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, post_id),
        CONSTRAINT fk_saved_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_saved_posts_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS saved_posts;`);
  }
}

