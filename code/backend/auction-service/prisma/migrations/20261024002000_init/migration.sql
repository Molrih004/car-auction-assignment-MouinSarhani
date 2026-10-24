-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "car_id" TEXT NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "starting_price" INTEGER NOT NULL,
    "reserve_price" INTEGER NOT NULL,
    "start_at" DATETIME NOT NULL,
    "end_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "on_hold" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auction_id" TEXT NOT NULL,
    "buyer_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "placed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "auctions_car_id_idx" ON "auctions"("car_id");

-- CreateIndex
CREATE INDEX "auctions_status_idx" ON "auctions"("status");

-- CreateIndex
CREATE INDEX "bids_auction_id_idx" ON "bids"("auction_id");

-- CreateIndex
CREATE UNIQUE INDEX "bids_auction_id_amount_key" ON "bids"("auction_id", "amount");
