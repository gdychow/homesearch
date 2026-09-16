-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Fundamental" AS ENUM ('LIGHT', 'SPACE', 'LOCATION', 'LAYOUT', 'QUALITY', 'WORK_REQUIRED');

-- CreateEnum
CREATE TYPE "ListingSource" AS ENUM ('MANUAL', 'ZILLOW_SCRAPE', 'MLS');

-- CreateTable
CREATE TABLE "Broker" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "buyingGroupId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerPasswordResetToken" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyingGroup" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "buyingGroupId" TEXT NOT NULL,
    "invitedByBrokerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupCriteria" (
    "id" TEXT NOT NULL,
    "buyingGroupId" TEXT NOT NULL,
    "areas" JSONB NOT NULL,
    "minBeds" INTEGER,
    "minBaths" INTEGER,
    "minSqft" INTEGER,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "stretchMaxPrice" INTEGER,
    "otherFeatures" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureCatalog" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "FeatureCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerMustHave" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "featureCatalogId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "BuyerMustHave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerFundamentalRank" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "fundamental" "Fundamental" NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "BuyerFundamentalRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "source" "ListingSource" NOT NULL,
    "externalId" TEXT,
    "address" TEXT NOT NULL,
    "zip" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "beds" INTEGER,
    "baths" DOUBLE PRECISION,
    "sqft" INTEGER,
    "price" INTEGER,
    "url" TEXT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupListing" (
    "id" TEXT NOT NULL,
    "buyingGroupId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "GroupListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyFeedback" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackFundamentalScore" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "fundamental" "Fundamental" NOT NULL,
    "stars" INTEGER NOT NULL,

    CONSTRAINT "FeedbackFundamentalScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackMustHaveScore" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "featureCatalogId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,

    CONSTRAINT "FeedbackMustHaveScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Broker_email_key" ON "Broker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_email_key" ON "Buyer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerPasswordResetToken_token_key" ON "BuyerPasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "GroupCriteria_buyingGroupId_key" ON "GroupCriteria"("buyingGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureCatalog_key_key" ON "FeatureCatalog"("key");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerMustHave_buyerId_featureCatalogId_key" ON "BuyerMustHave"("buyerId", "featureCatalogId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerMustHave_buyerId_rank_key" ON "BuyerMustHave"("buyerId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerFundamentalRank_buyerId_fundamental_key" ON "BuyerFundamentalRank"("buyerId", "fundamental");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerFundamentalRank_buyerId_rank_key" ON "BuyerFundamentalRank"("buyerId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "GroupListing_buyingGroupId_listingId_key" ON "GroupListing"("buyingGroupId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackFundamentalScore_feedbackId_fundamental_key" ON "FeedbackFundamentalScore"("feedbackId", "fundamental");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackMustHaveScore_feedbackId_featureCatalogId_key" ON "FeedbackMustHaveScore"("feedbackId", "featureCatalogId");

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_buyingGroupId_fkey" FOREIGN KEY ("buyingGroupId") REFERENCES "BuyingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerPasswordResetToken" ADD CONSTRAINT "BuyerPasswordResetToken_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyingGroup" ADD CONSTRAINT "BuyingGroup_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_buyingGroupId_fkey" FOREIGN KEY ("buyingGroupId") REFERENCES "BuyingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByBrokerId_fkey" FOREIGN KEY ("invitedByBrokerId") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupCriteria" ADD CONSTRAINT "GroupCriteria_buyingGroupId_fkey" FOREIGN KEY ("buyingGroupId") REFERENCES "BuyingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerMustHave" ADD CONSTRAINT "BuyerMustHave_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerMustHave" ADD CONSTRAINT "BuyerMustHave_featureCatalogId_fkey" FOREIGN KEY ("featureCatalogId") REFERENCES "FeatureCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerFundamentalRank" ADD CONSTRAINT "BuyerFundamentalRank_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupListing" ADD CONSTRAINT "GroupListing_buyingGroupId_fkey" FOREIGN KEY ("buyingGroupId") REFERENCES "BuyingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupListing" ADD CONSTRAINT "GroupListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyFeedback" ADD CONSTRAINT "PropertyFeedback_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyFeedback" ADD CONSTRAINT "PropertyFeedback_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackFundamentalScore" ADD CONSTRAINT "FeedbackFundamentalScore_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "PropertyFeedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackMustHaveScore" ADD CONSTRAINT "FeedbackMustHaveScore_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "PropertyFeedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackMustHaveScore" ADD CONSTRAINT "FeedbackMustHaveScore_featureCatalogId_fkey" FOREIGN KEY ("featureCatalogId") REFERENCES "FeatureCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
