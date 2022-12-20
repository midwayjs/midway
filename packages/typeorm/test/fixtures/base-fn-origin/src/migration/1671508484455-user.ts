import { MigrationInterface, QueryRunner } from "typeorm";

export class user1671508484455 implements MigrationInterface {
  name = 'user1671508484455'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "temporary_photo" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "newName" varchar(100) NOT NULL, "description" text NOT NULL, "filename" varchar NOT NULL, "views" double NOT NULL, "isPublished" boolean NOT NULL)`);
    await queryRunner.query(`INSERT INTO "temporary_photo"("id", "newName", "description", "filename", "views", "isPublished") SELECT "id", "name", "description", "filename", "views", "isPublished" FROM "photo"`);
    await queryRunner.query(`DROP TABLE "photo"`);
    await queryRunner.query(`ALTER TABLE "temporary_photo" RENAME TO "photo"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "photo" RENAME TO "temporary_photo"`);
    await queryRunner.query(`CREATE TABLE "photo" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(100) NOT NULL, "description" text NOT NULL, "filename" varchar NOT NULL, "views" double NOT NULL, "isPublished" boolean NOT NULL)`);
    await queryRunner.query(`INSERT INTO "photo"("id", "name", "description", "filename", "views", "isPublished") SELECT "id", "newName", "description", "filename", "views", "isPublished" FROM "temporary_photo"`);
    await queryRunner.query(`DROP TABLE "temporary_photo"`);
  }

}
