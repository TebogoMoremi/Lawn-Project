-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'QUOTE_REQUESTED', 'AWAITING_AVAILABILITY', 'AVAILABILITY_SELECTED', 'UNDER_REVIEW', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'QUOTE_DECLINED', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'SHARED_PROPERTY', 'OTHER');

-- CreateEnum
CREATE TYPE "LawnCondition" AS ENUM ('MAINTAINED', 'OVERGROWN', 'HEAVILY_OVERGROWN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ServiceFrequency" AS ENUM ('ONCE_OFF', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('GRASS_CUTTING', 'GARDEN_CLEANUP', 'HEDGE_TRIMMING', 'LAWN_MAINTENANCE');

-- CreateEnum
CREATE TYPE "GalleryStage" AS ENUM ('BEFORE', 'AFTER', 'STANDALONE');

-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('SYSTEM', 'ADMIN', 'CUSTOMER');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    "email" VARCHAR(254),
    "phone" VARCHAR(16),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "addressLine1" VARCHAR(200) NOT NULL,
    "addressLine2" VARCHAR(200),
    "suburb" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "shortDescription" VARCHAR(300) NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT[],
    "included" TEXT[],
    "symbol" VARCHAR(20),
    "faq" JSONB NOT NULL DEFAULT '[]',
    "seoTitle" VARCHAR(200),
    "seoDescription" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(40) NOT NULL,
    "customerId" UUID NOT NULL,
    "addressId" UUID NOT NULL,
    "propertyType" "PropertyType",
    "lawnSize" DECIMAL(12,2),
    "lawnCondition" "LawnCondition",
    "frequency" "ServiceFrequency",
    "currency" CHAR(3) NOT NULL DEFAULT 'ZAR',
    "estimatedMin" DECIMAL(12,2),
    "estimatedMax" DECIMAL(12,2),
    "finalPrice" DECIMAL(12,2),
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "serviceName" VARCHAR(120) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2),
    "estimatedMin" DECIMAL(12,2),
    "estimatedMax" DECIMAL(12,2),
    "finalPrice" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotePhoto" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "storageKey" VARCHAR(1024) NOT NULL,
    "url" TEXT,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "altText" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteStatusHistory" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "status" "QuoteStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" UUID NOT NULL,
    "startTime" TIMESTAMPTZ(3) NOT NULL,
    "endTime" TIMESTAMPTZ(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'UNAVAILABLE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(40) NOT NULL,
    "quoteId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "availabilitySlotId" UUID NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledStart" TIMESTAMPTZ(3) NOT NULL,
    "scheduledEnd" TIMESTAMPTZ(3) NOT NULL,
    "confirmedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "customerId" UUID,
    "quoteId" UUID,
    "bookingId" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "recipient" VARCHAR(320) NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" VARCHAR(200) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "providerReference" VARCHAR(200),
    "failureReason" TEXT,
    "scheduledFor" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMPTZ(3),
    "lockToken" UUID,
    "sentAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" "GalleryCategory" NOT NULL,
    "projectKey" VARCHAR(100) NOT NULL,
    "stage" "GalleryStage" NOT NULL DEFAULT 'STANDALONE',
    "storageKey" VARCHAR(1024),
    "url" TEXT,
    "altText" VARCHAR(500) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "isConcept" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" UUID NOT NULL,
    "customerId" UUID,
    "quoteId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" VARCHAR(100),
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ServiceToServiceArea" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ServiceToServiceArea_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_customerId_key" ON "Address"("id", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_active_sortOrder_idx" ON "Service"("active", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_slug_key" ON "ServiceArea"("slug");

-- CreateIndex
CREATE INDEX "ServiceArea_active_city_idx" ON "ServiceArea"("active", "city");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_reference_key" ON "Quote"("reference");

-- CreateIndex
CREATE INDEX "Quote_customerId_createdAt_idx" ON "Quote"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_addressId_customerId_idx" ON "Quote"("addressId", "customerId");

-- CreateIndex
CREATE INDEX "Quote_status_createdAt_idx" ON "Quote"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_id_customerId_key" ON "Quote"("id", "customerId");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteItem_serviceId_idx" ON "QuoteItem"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotePhoto_storageKey_key" ON "QuotePhoto"("storageKey");

-- CreateIndex
CREATE INDEX "QuotePhoto_quoteId_createdAt_idx" ON "QuotePhoto"("quoteId", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteStatusHistory_quoteId_createdAt_idx" ON "QuoteStatusHistory"("quoteId", "createdAt");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_status_startTime_idx" ON "AvailabilitySlot"("status", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_startTime_endTime_key" ON "AvailabilitySlot"("startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_quoteId_key" ON "Booking"("quoteId");

-- CreateIndex
CREATE INDEX "Booking_customerId_scheduledStart_idx" ON "Booking"("customerId", "scheduledStart");

-- CreateIndex
CREATE INDEX "Booking_availabilitySlotId_status_idx" ON "Booking"("availabilitySlotId", "status");

-- CreateIndex
CREATE INDEX "Booking_status_scheduledStart_idx" ON "Booking"("status", "scheduledStart");

-- CreateIndex
CREATE INDEX "Booking_scheduledStart_idx" ON "Booking"("scheduledStart");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_id_customerId_key" ON "Booking"("id", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_quoteId_customerId_key" ON "Booking"("quoteId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_idempotencyKey_key" ON "Notification"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Notification_status_scheduledFor_idx" ON "Notification"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Notification_status_lockedAt_idx" ON "Notification"("status", "lockedAt");

-- CreateIndex
CREATE INDEX "Notification_customerId_createdAt_idx" ON "Notification"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_quoteId_idx" ON "Notification"("quoteId");

-- CreateIndex
CREATE INDEX "Notification_bookingId_idx" ON "Notification"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryImage_storageKey_key" ON "GalleryImage"("storageKey");

-- CreateIndex
CREATE INDEX "GalleryImage_active_category_sortOrder_idx" ON "GalleryImage"("active", "category", "sortOrder");

-- CreateIndex
CREATE INDEX "GalleryImage_projectKey_stage_idx" ON "GalleryImage"("projectKey", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_customerId_idx" ON "Review"("customerId");

-- CreateIndex
CREATE INDEX "Review_approved_createdAt_idx" ON "Review"("approved", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_customerId_key" ON "Review"("bookingId", "customerId");

-- CreateIndex
CREATE INDEX "AIConversation_customerId_createdAt_idx" ON "AIConversation"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "AIConversation_quoteId_idx" ON "AIConversation"("quoteId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorType_actorId_createdAt_idx" ON "AuditLog"("actorType", "actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "_ServiceToServiceArea_B_index" ON "_ServiceToServiceArea"("B");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_addressId_customerId_fkey" FOREIGN KEY ("addressId", "customerId") REFERENCES "Address"("id", "customerId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "QuotePhoto" ADD CONSTRAINT "QuotePhoto_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "QuoteStatusHistory" ADD CONSTRAINT "QuoteStatusHistory_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_quoteId_customerId_fkey" FOREIGN KEY ("quoteId", "customerId") REFERENCES "Quote"("id", "customerId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_availabilitySlotId_fkey" FOREIGN KEY ("availabilitySlotId") REFERENCES "AvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_customerId_fkey" FOREIGN KEY ("bookingId", "customerId") REFERENCES "Booking"("id", "customerId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "_ServiceToServiceArea" ADD CONSTRAINT "_ServiceToServiceArea_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToServiceArea" ADD CONSTRAINT "_ServiceToServiceArea_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Additional PostgreSQL constraints not expressible in Prisma's schema DSL.
-- This migration was generated offline; it has NOT been applied or database-tested.
ALTER TABLE "Customer"
  ADD CONSTRAINT "Customer_contact_required" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL),
  ADD CONSTRAINT "Customer_email_normalized" CHECK ("email" IS NULL OR ("email" = lower(btrim("email")) AND length("email") > 3)),
  ADD CONSTRAINT "Customer_phone_normalized" CHECK ("phone" IS NULL OR "phone" ~ '^\+[1-9][0-9]{7,14}$'),
  ADD CONSTRAINT "Customer_firstName_not_blank" CHECK (length(btrim("firstName")) > 0);

ALTER TABLE "Address"
  ADD CONSTRAINT "Address_coordinates_valid" CHECK (
    ("latitude" IS NULL) = ("longitude" IS NULL)
    AND ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90)
    AND ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180)
  );

ALTER TABLE "Service"
  ADD CONSTRAINT "Service_slug_valid" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT "Service_faq_array" CHECK (jsonb_typeof("faq") = 'array');
ALTER TABLE "ServiceArea"
  ADD CONSTRAINT "ServiceArea_slug_valid" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

ALTER TABLE "Quote"
  ADD CONSTRAINT "Quote_money_valid" CHECK (
    ("estimatedMin" IS NULL OR ("estimatedMin" >= 0 AND "estimatedMin" <> 'NaN'::numeric))
    AND ("estimatedMax" IS NULL OR ("estimatedMax" >= 0 AND "estimatedMax" <> 'NaN'::numeric))
    AND ("finalPrice" IS NULL OR ("finalPrice" >= 0 AND "finalPrice" <> 'NaN'::numeric))
    AND ("estimatedMin" IS NULL OR "estimatedMax" IS NULL OR "estimatedMin" <= "estimatedMax")
  ),
  ADD CONSTRAINT "Quote_lawnSize_positive" CHECK ("lawnSize" IS NULL OR ("lawnSize" > 0 AND "lawnSize" <> 'NaN'::numeric)),
  ADD CONSTRAINT "Quote_currency_valid" CHECK ("currency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "Quote_reference_not_blank" CHECK (length(btrim("reference")) > 0);

ALTER TABLE "QuoteItem"
  ADD CONSTRAINT "QuoteItem_quantity_positive" CHECK ("quantity" > 0 AND "quantity" <> 'NaN'::numeric),
  ADD CONSTRAINT "QuoteItem_money_valid" CHECK (
    ("unitPrice" IS NULL OR ("unitPrice" >= 0 AND "unitPrice" <> 'NaN'::numeric))
    AND ("estimatedMin" IS NULL OR ("estimatedMin" >= 0 AND "estimatedMin" <> 'NaN'::numeric))
    AND ("estimatedMax" IS NULL OR ("estimatedMax" >= 0 AND "estimatedMax" <> 'NaN'::numeric))
    AND ("finalPrice" IS NULL OR ("finalPrice" >= 0 AND "finalPrice" <> 'NaN'::numeric))
    AND ("estimatedMin" IS NULL OR "estimatedMax" IS NULL OR "estimatedMin" <= "estimatedMax")
  );

ALTER TABLE "QuotePhoto"
  ADD CONSTRAINT "QuotePhoto_fileSize_positive" CHECK ("fileSize" > 0),
  ADD CONSTRAINT "QuotePhoto_image_mime" CHECK ("mimeType" LIKE 'image/%');

ALTER TABLE "AvailabilitySlot"
  ADD CONSTRAINT "AvailabilitySlot_window_valid" CHECK ("endTime" > "startTime"),
  ADD CONSTRAINT "AvailabilitySlot_capacity_positive" CHECK ("capacity" > 0);

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_window_valid" CHECK ("scheduledEnd" > "scheduledStart"),
  ADD CONSTRAINT "Booking_reference_not_blank" CHECK (length(btrim("reference")) > 0),
  ADD CONSTRAINT "Booking_completion_recorded" CHECK ("status" <> 'COMPLETED' OR "completedAt" IS NOT NULL),
  ADD CONSTRAINT "Booking_cancellation_recorded" CHECK ("status" <> 'CANCELLED' OR "cancelledAt" IS NOT NULL),
  ADD CONSTRAINT "Booking_confirmation_recorded" CHECK ("status" NOT IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED') OR "confirmedAt" IS NOT NULL);

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_attempts_valid" CHECK ("attempts" >= 0 AND "maxAttempts" > 0),
  ADD CONSTRAINT "Notification_recipient_not_blank" CHECK (length(btrim("recipient")) > 0),
  ADD CONSTRAINT "Notification_lease_pair" CHECK (("lockedAt" IS NULL) = ("lockToken" IS NULL)),
  ADD CONSTRAINT "Notification_sent_recorded" CHECK ("status" <> 'SENT' OR "sentAt" IS NOT NULL);

ALTER TABLE "GalleryImage"
  ADD CONSTRAINT "GalleryImage_asset_required" CHECK (NULLIF(btrim("storageKey"), '') IS NOT NULL OR NULLIF(btrim("url"), '') IS NOT NULL),
  ADD CONSTRAINT "GalleryImage_dimensions_positive" CHECK ("width" > 0 AND "height" > 0),
  ADD CONSTRAINT "GalleryImage_alt_not_blank" CHECK (length(btrim("altText")) > 0);
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_content_not_blank" CHECK (length(btrim("content")) > 0);
