-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BUYER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("created_at", "email", "id", "password_hash", "role", "updated_at") SELECT "created_at", "email", "id", "password_hash", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Old roles from the first version: USER becomes BUYER, ADMIN becomes STAFF
UPDATE "users" SET "role" = 'BUYER' WHERE "role" = 'USER';
UPDATE "users" SET "role" = 'STAFF' WHERE "role" = 'ADMIN';
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
