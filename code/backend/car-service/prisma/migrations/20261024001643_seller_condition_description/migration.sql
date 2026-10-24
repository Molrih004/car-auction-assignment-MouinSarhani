-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seller_id" INTEGER NOT NULL DEFAULT 0,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "description" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_cars" ("color", "created_at", "id", "make", "mileage", "model", "price", "year") SELECT "color", "created_at", "id", "make", "mileage", "model", "price", "year" FROM "cars";
DROP TABLE "cars";
ALTER TABLE "new_cars" RENAME TO "cars";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
