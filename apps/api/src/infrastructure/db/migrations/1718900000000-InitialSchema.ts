import { type MigrationInterface, type QueryRunner } from 'typeorm'

/**
 * Initial schema: users and vacation_requests, with the indexes that back the
 * overlap check and the listing/filter queries. Status and role are stored as
 * varchar (simple, additive as the enum grows). IDs are application-generated
 * UUIDs, so no DB default is required.
 */
export class InitialSchema1718900000000 implements MigrationInterface {
  name = 'InitialSchema1718900000000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY,
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "role" varchar NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_users_email" UNIQUE ("email")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "vacation_requests" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "reason" text,
        "status" varchar NOT NULL DEFAULT 'Pending',
        "comments" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_vacation_requests_user" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(`
      CREATE INDEX "idx_vacation_requests_user_dates"
        ON "vacation_requests" ("user_id", "start_date", "end_date")
    `)
    await queryRunner.query(`
      CREATE INDEX "idx_vacation_requests_status"
        ON "vacation_requests" ("status")
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vacation_requests_status"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_vacation_requests_user_dates"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "vacation_requests"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`)
  }
}
