-- CreateEnum
CREATE TYPE "ListingInterestStatus" AS ENUM ('INTERESTED', 'NOT_INTERESTED');

-- CreateTable
CREATE TABLE "BuyerListingInterest" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" "ListingInterestStatus" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerListingInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuyerListingInterest_buyerId_listingId_key" ON "BuyerListingInterest"("buyerId", "listingId");

-- AddForeignKey
ALTER TABLE "BuyerListingInterest" ADD CONSTRAINT "BuyerListingInterest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerListingInterest" ADD CONSTRAINT "BuyerListingInterest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
