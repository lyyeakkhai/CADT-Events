/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_seat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_speaker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `speaker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `telegram_notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `venue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `venue_seat_template` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_venue_id_fkey";

-- DropForeignKey
ALTER TABLE "event_department" DROP CONSTRAINT "event_department_department_id_fkey";

-- DropForeignKey
ALTER TABLE "event_department" DROP CONSTRAINT "event_department_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_seat" DROP CONSTRAINT "event_seat_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_seat" DROP CONSTRAINT "event_seat_seat_template_id_fkey";

-- DropForeignKey
ALTER TABLE "event_speaker" DROP CONSTRAINT "event_speaker_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_speaker" DROP CONSTRAINT "event_speaker_speaker_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite" DROP CONSTRAINT "favorite_event_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite" DROP CONSTRAINT "favorite_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_event_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "registration" DROP CONSTRAINT "registration_event_id_fkey";

-- DropForeignKey
ALTER TABLE "registration" DROP CONSTRAINT "registration_event_seat_id_fkey";

-- DropForeignKey
ALTER TABLE "registration" DROP CONSTRAINT "registration_user_id_fkey";

-- DropForeignKey
ALTER TABLE "telegram_notification" DROP CONSTRAINT "telegram_notification_notification_id_fkey";

-- DropForeignKey
ALTER TABLE "user_account" DROP CONSTRAINT "user_account_department_id_fkey";

-- DropForeignKey
ALTER TABLE "venue_seat_template" DROP CONSTRAINT "venue_seat_template_venue_id_fkey";

-- DropTable
DROP TABLE "admin";

-- DropTable
DROP TABLE "department";

-- DropTable
DROP TABLE "event";

-- DropTable
DROP TABLE "event_department";

-- DropTable
DROP TABLE "event_seat";

-- DropTable
DROP TABLE "event_speaker";

-- DropTable
DROP TABLE "favorite";

-- DropTable
DROP TABLE "notification";

-- DropTable
DROP TABLE "registration";

-- DropTable
DROP TABLE "speaker";

-- DropTable
DROP TABLE "telegram_notification";

-- DropTable
DROP TABLE "user_account";

-- DropTable
DROP TABLE "venue";

-- DropTable
DROP TABLE "venue_seat_template";

-- DropEnum
DROP TYPE "account_status_enum";

-- DropEnum
DROP TYPE "admin_level_enum";

-- DropEnum
DROP TYPE "event_seat_status_enum";

-- DropEnum
DROP TYPE "event_status_enum";

-- DropEnum
DROP TYPE "event_type_enum";

-- DropEnum
DROP TYPE "notification_type_enum";

-- DropEnum
DROP TYPE "telegram_status_enum";

-- DropEnum
DROP TYPE "user_role_enum";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "capacity" INTEGER,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "start_timestamp" TIMESTAMP(3) NOT NULL,
    "end_timestamp" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "cover_image_url" TEXT,
    "credit_value" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER,
    "admin_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "venue_id" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "booking_reference_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_seat_id" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "qr_code" TEXT,
    "checked_in_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "titleRole" TEXT,
    "organization" TEXT,
    "bio" TEXT,
    "profile_image_url" TEXT,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "events_start_timestamp_end_timestamp_idx" ON "events"("start_timestamp", "end_timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_reference_id_key" ON "bookings"("booking_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
