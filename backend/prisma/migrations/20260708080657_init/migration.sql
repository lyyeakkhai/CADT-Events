-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('student', 'staff', 'guest');

-- CreateEnum
CREATE TYPE "admin_level_enum" AS ENUM ('super_admin', 'department_head', 'event_organizer');

-- CreateEnum
CREATE TYPE "account_status_enum" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "event_status_enum" AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "event_type_enum" AS ENUM ('workshop', 'seminar', 'competition', 'conference', 'career_fair', 'networking', 'other');

-- CreateEnum
CREATE TYPE "event_seat_status_enum" AS ENUM ('available', 'held', 'booked');

-- CreateEnum
CREATE TYPE "notification_type_enum" AS ENUM ('announcement', 'registration', 'event_reminder', 'system', 'telegram');

-- CreateEnum
CREATE TYPE "telegram_status_enum" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "admin_level" "admin_level_enum" NOT NULL DEFAULT 'event_organizer',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "department" (
    "department_id" VARCHAR(50) NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,
    "specialization" VARCHAR(100),

    CONSTRAINT "department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "user_id" VARCHAR(50) NOT NULL,
    "department_id" VARCHAR(50),
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role_enum" NOT NULL,
    "student_staff_id" VARCHAR(50),
    "organization" VARCHAR(100),
    "avatar_url" VARCHAR(255),
    "telegram_chat_id" VARCHAR(50),
    "account_status" "account_status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "venue" (
    "venue_id" VARCHAR(50) NOT NULL,
    "venue_name" VARCHAR(100) NOT NULL,
    "total_capacity" INTEGER NOT NULL,

    CONSTRAINT "venue_pkey" PRIMARY KEY ("venue_id")
);

-- CreateTable
CREATE TABLE "venue_seat_template" (
    "seat_template_id" VARCHAR(50) NOT NULL,
    "venue_id" VARCHAR(50) NOT NULL,
    "seat_label" VARCHAR(20) NOT NULL,
    "seating_zone" VARCHAR(50),

    CONSTRAINT "venue_seat_template_pkey" PRIMARY KEY ("seat_template_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" VARCHAR(50) NOT NULL,
    "admin_id" VARCHAR(50),
    "venue_id" VARCHAR(50),
    "event_title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "event_type" "event_type_enum" NOT NULL,
    "status" "event_status_enum" NOT NULL DEFAULT 'draft',
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "cover_image_url" VARCHAR(255),
    "badge" VARCHAR(50),
    "is_featured" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "speaker" (
    "speaker_id" VARCHAR(50) NOT NULL,
    "speaker_name" VARCHAR(100) NOT NULL,
    "title_role" VARCHAR(100),
    "organization" VARCHAR(100),
    "bio" TEXT,
    "profile_image_url" VARCHAR(255),

    CONSTRAINT "speaker_pkey" PRIMARY KEY ("speaker_id")
);

-- CreateTable
CREATE TABLE "event_speaker" (
    "event_id" VARCHAR(50) NOT NULL,
    "speaker_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "event_speaker_pkey" PRIMARY KEY ("event_id","speaker_id")
);

-- CreateTable
CREATE TABLE "event_department" (
    "event_id" VARCHAR(50) NOT NULL,
    "department_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "event_department_pkey" PRIMARY KEY ("event_id","department_id")
);

-- CreateTable
CREATE TABLE "event_seat" (
    "event_seat_id" VARCHAR(50) NOT NULL,
    "event_id" VARCHAR(50) NOT NULL,
    "seat_template_id" VARCHAR(50) NOT NULL,
    "status" "event_seat_status_enum" NOT NULL DEFAULT 'available',
    "held_time" TIMESTAMP(6),
    "expired_time" TIMESTAMP(6),

    CONSTRAINT "event_seat_pkey" PRIMARY KEY ("event_seat_id")
);

-- CreateTable
CREATE TABLE "registration" (
    "registration_id" VARCHAR(50) NOT NULL,
    "booking_reference" VARCHAR(100) NOT NULL,
    "qr_code" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" VARCHAR(50) NOT NULL,
    "event_id" VARCHAR(50) NOT NULL,
    "event_seat_id" VARCHAR(50),

    CONSTRAINT "registration_pkey" PRIMARY KEY ("registration_id")
);

-- CreateTable
CREATE TABLE "favorite" (
    "favorite_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "event_id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("favorite_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "event_id" VARCHAR(50),
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "notification_type_enum" NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "telegram_notification" (
    "telegram_notification_id" VARCHAR(50) NOT NULL,
    "notification_id" VARCHAR(50) NOT NULL,
    "message_text" TEXT NOT NULL,
    "status" "telegram_status_enum" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_notification_pkey" PRIMARY KEY ("telegram_notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_telegram_chat_id_key" ON "user_account"("telegram_chat_id");

-- CreateIndex
CREATE INDEX "idx_event_dates" ON "event"("start_time", "end_time");

-- CreateIndex
CREATE INDEX "idx_seat_state" ON "event_seat"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "registration_booking_reference_key" ON "registration"("booking_reference");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_bookmark" ON "favorite"("user_id", "event_id");

-- CreateIndex
CREATE INDEX "idx_user_inbox" ON "notification"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_telegram_bot_outbox" ON "telegram_notification"("status");

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_seat_template" ADD CONSTRAINT "venue_seat_template_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"("venue_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"("venue_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speaker" ADD CONSTRAINT "event_speaker_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_speaker" ADD CONSTRAINT "event_speaker_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "speaker"("speaker_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_department" ADD CONSTRAINT "event_department_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_department" ADD CONSTRAINT "event_department_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("department_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_seat" ADD CONSTRAINT "event_seat_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_seat" ADD CONSTRAINT "event_seat_seat_template_id_fkey" FOREIGN KEY ("seat_template_id") REFERENCES "venue_seat_template"("seat_template_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_event_seat_id_fkey" FOREIGN KEY ("event_seat_id") REFERENCES "event_seat"("event_seat_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_notification" ADD CONSTRAINT "telegram_notification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;
