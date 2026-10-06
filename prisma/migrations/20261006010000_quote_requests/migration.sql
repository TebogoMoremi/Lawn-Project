-- CreateEnum
CREATE TYPE "LawnSizeCategory" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "lawnSizeCategory" "LawnSizeCategory",
ADD COLUMN     "privacyAcknowledgedAt" TIMESTAMPTZ(3),
ADD COLUMN     "privacyVersion" VARCHAR(30),
ADD COLUMN     "receiptExpiresAt" TIMESTAMPTZ(3),
ADD COLUMN     "submissionDigest" CHAR(64),
ADD COLUMN     "submissionTokenHash" CHAR(64);

-- CreateTable
CREATE TABLE "QuoteReferenceCounter" (
    "year" INTEGER NOT NULL,
    "lastValue" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "QuoteReferenceCounter_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_submissionTokenHash_key" ON "Quote"("submissionTokenHash");
