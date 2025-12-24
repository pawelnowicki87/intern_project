import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePasswordHashNullable1766564151894
implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 🔹 Pozwalamy na NULL dla password_hash (OAuth users)
    await queryRunner.query(`
      ALTER TABLE user_credentials
      ALTER COLUMN password_hash DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 🔹 Cofnięcie zmiany (UWAGA: zadziała tylko jeśli nie ma NULL w kolumnie)
    await queryRunner.query(`
      ALTER TABLE user_credentials
      ALTER COLUMN password_hash SET NOT NULL
    `);
  }
}
