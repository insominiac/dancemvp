-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'INSTRUCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ClassStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('PAYMENT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('CREATED', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."Proficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "public"."ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "public"."PartnerLookingFor" AS ENUM ('PRACTICE_PARTNER', 'COMPETITION_PARTNER', 'SOCIAL_PARTNER', 'LEARNING_BUDDY');

-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEFT_EARLY', 'EXCUSED');

-- CreateEnum
CREATE TYPE "public"."EngagementLevel" AS ENUM ('LOW', 'NEUTRAL', 'HIGH');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "bio" TEXT,
    "profile_image" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "website_url" TEXT,
    "instagram_handle" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instructors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialty" TEXT,
    "experience_years" INTEGER,
    "rating" DECIMAL(3,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration_mins" INTEGER NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "schedule_days" TEXT,
    "schedule_time" TEXT,
    "requirements" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "venue_id" TEXT,
    "status" "public"."ClassStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "venue_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "max_attendees" INTEGER NOT NULL,
    "current_attendees" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "organizer_user_id" TEXT,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "phone" TEXT,
    "website_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_instructors" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "class_id" TEXT,
    "event_id" TEXT,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "confirmation_code" TEXT,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "stripe_session_id" TEXT,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT,
    "user_id" TEXT NOT NULL,
    "provider" "public"."PaymentProvider" NOT NULL,
    "provider_payment_id" TEXT,
    "provider_refund_id" TEXT,
    "type" "public"."TransactionType" NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'CREATED',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payload" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "brand" TEXT,
    "failure_reason" TEXT,
    "last_4" TEXT,
    "payment_method_type" TEXT,
    "stripe_session_id" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dance_styles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "benefits" TEXT,
    "characteristics" TEXT,
    "description" TEXT,
    "difficulty" TEXT,
    "icon" TEXT,
    "image" TEXT,
    "instructors" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "musicStyle" TEXT,
    "origin" TEXT,
    "price" TEXT,
    "schedule" TEXT,
    "sort_order" INTEGER,
    "subtitle" TEXT,
    "video_url" TEXT,

    CONSTRAINT "dance_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_styles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "style_id" TEXT NOT NULL,
    "proficiency" "public"."Proficiency" NOT NULL DEFAULT 'BEGINNER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_styles" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "style_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_styles" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "style_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."forum_posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "replies_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."forum_replies" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "is_solution" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "action_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" "public"."UserRole" NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "old_values" TEXT,
    "new_values" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "admin_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testimonials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "experience_level" "public"."ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "looking_for" "public"."PartnerLookingFor"[],
    "age_range" TEXT,
    "profile_picture" TEXT,
    "is_active_for_matching" BOOLEAN NOT NULL DEFAULT true,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profile_dance_styles" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "style_id" TEXT NOT NULL,
    "level" "public"."ExperienceLevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_dance_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."match_requests" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."matches" (
    "id" TEXT NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "match_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "unmatched_at" TIMESTAMP(3),
    "unmatched_by" TEXT,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_pages" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "author" TEXT,
    "robots" TEXT,
    "canonical" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "og_type" TEXT,
    "og_url" TEXT,
    "twitter_card" TEXT,
    "twitter_title" TEXT,
    "twitter_description" TEXT,
    "twitter_image" TEXT,
    "twitter_creator" TEXT,
    "structured_data" TEXT,
    "custom_meta" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "last_modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_attendance" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checked_in_at" TIMESTAMP(3),
    "checked_out_at" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_feedback" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "teachingRating" INTEGER NOT NULL,
    "contentRating" INTEGER NOT NULL,
    "engagementRating" INTEGER NOT NULL,
    "difficultyRating" INTEGER NOT NULL,
    "paceRating" INTEGER NOT NULL,
    "comment" TEXT,
    "would_recommend" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instructor_performance" (
    "id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_classes" INTEGER NOT NULL DEFAULT 0,
    "total_students" INTEGER NOT NULL DEFAULT 0,
    "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION,
    "attendance_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retention_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "new_students" INTEGER NOT NULL DEFAULT 0,
    "returning_students" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "average_class_size" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "no_shows" INTEGER NOT NULL DEFAULT 0,
    "cancellations" INTEGER NOT NULL DEFAULT 0,
    "feedback_count" INTEGER NOT NULL DEFAULT 0,
    "recommendation_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructor_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_engagement" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "engagementLevel" "public"."EngagementLevel" NOT NULL DEFAULT 'NEUTRAL',
    "participation_score" INTEGER NOT NULL DEFAULT 0,
    "attention_score" INTEGER NOT NULL DEFAULT 0,
    "improvement_progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "questions_asked" INTEGER NOT NULL DEFAULT 0,
    "help_requested" INTEGER NOT NULL DEFAULT 0,
    "practice_time" INTEGER NOT NULL DEFAULT 0,
    "struggling_areas" TEXT,
    "strengths" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_analytics" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "instructor_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "actual_attendees" INTEGER NOT NULL DEFAULT 0,
    "no_shows" INTEGER NOT NULL DEFAULT 0,
    "late_arrivals" INTEGER NOT NULL DEFAULT 0,
    "early_departures" INTEGER NOT NULL DEFAULT 0,
    "average_duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "energy_level" INTEGER NOT NULL DEFAULT 0,
    "difficulty_level" INTEGER NOT NULL DEFAULT 0,
    "pace_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "student_satisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "weather_condition" TEXT,
    "special_events" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "instructors_user_id_key" ON "public"."instructors"("user_id");

-- CreateIndex
CREATE INDEX "instructors_user_id_idx" ON "public"."instructors"("user_id");

-- CreateIndex
CREATE INDEX "classes_created_at_idx" ON "public"."classes"("created_at");

-- CreateIndex
CREATE INDEX "classes_is_active_idx" ON "public"."classes"("is_active");

-- CreateIndex
CREATE INDEX "classes_start_date_idx" ON "public"."classes"("start_date");

-- CreateIndex
CREATE INDEX "classes_venue_id_idx" ON "public"."classes"("venue_id");

-- CreateIndex
CREATE INDEX "classes_status_idx" ON "public"."classes"("status");

-- CreateIndex
CREATE INDEX "events_venue_id_idx" ON "public"."events"("venue_id");

-- CreateIndex
CREATE INDEX "events_start_date_start_time_idx" ON "public"."events"("start_date", "start_time");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "public"."events"("status");

-- CreateIndex
CREATE INDEX "venues_name_idx" ON "public"."venues"("name");

-- CreateIndex
CREATE INDEX "venues_city_idx" ON "public"."venues"("city");

-- CreateIndex
CREATE INDEX "venues_country_idx" ON "public"."venues"("country");

-- CreateIndex
CREATE UNIQUE INDEX "class_instructors_class_id_instructor_id_key" ON "public"."class_instructors"("class_id", "instructor_id");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "public"."bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "public"."bookings"("created_at");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "public"."bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_payment_status_idx" ON "public"."bookings"("payment_status");

-- CreateIndex
CREATE INDEX "bookings_stripe_session_id_idx" ON "public"."bookings"("stripe_session_id");

-- CreateIndex
CREATE INDEX "transactions_stripe_session_id_idx" ON "public"."transactions"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_provider_provider_payment_id_key" ON "public"."transactions"("provider", "provider_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "dance_styles_name_key" ON "public"."dance_styles"("name");

-- CreateIndex
CREATE INDEX "dance_styles_is_active_idx" ON "public"."dance_styles"("is_active");

-- CreateIndex
CREATE INDEX "dance_styles_is_featured_idx" ON "public"."dance_styles"("is_featured");

-- CreateIndex
CREATE INDEX "dance_styles_sort_order_idx" ON "public"."dance_styles"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "user_styles_user_id_style_id_key" ON "public"."user_styles"("user_id", "style_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_styles_class_id_style_id_key" ON "public"."class_styles"("class_id", "style_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_styles_event_id_style_id_key" ON "public"."event_styles"("event_id", "style_id");

-- CreateIndex
CREATE INDEX "forum_posts_created_at_idx" ON "public"."forum_posts"("created_at");

-- CreateIndex
CREATE INDEX "forum_replies_created_at_idx" ON "public"."forum_replies"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_name_key" ON "public"."notification_templates"("name");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "public"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_device_id_idx" ON "public"."sessions"("device_id");

-- CreateIndex
CREATE INDEX "sessions_is_active_idx" ON "public"."sessions"("is_active");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "public"."sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_device_id_user_role_key" ON "public"."sessions"("device_id", "user_role");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "public"."user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_location_idx" ON "public"."user_profiles"("location");

-- CreateIndex
CREATE INDEX "user_profiles_experience_level_idx" ON "public"."user_profiles"("experience_level");

-- CreateIndex
CREATE INDEX "user_profiles_is_active_for_matching_idx" ON "public"."user_profiles"("is_active_for_matching");

-- CreateIndex
CREATE INDEX "user_profiles_last_active_at_idx" ON "public"."user_profiles"("last_active_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_dance_styles_profile_id_style_id_key" ON "public"."user_profile_dance_styles"("profile_id", "style_id");

-- CreateIndex
CREATE INDEX "match_requests_status_idx" ON "public"."match_requests"("status");

-- CreateIndex
CREATE INDEX "match_requests_created_at_idx" ON "public"."match_requests"("created_at");

-- CreateIndex
CREATE INDEX "match_requests_expires_at_idx" ON "public"."match_requests"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "match_requests_sender_id_receiver_id_key" ON "public"."match_requests"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "matches_is_active_idx" ON "public"."matches"("is_active");

-- CreateIndex
CREATE INDEX "matches_created_at_idx" ON "public"."matches"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "matches_user1_id_user2_id_key" ON "public"."matches"("user1_id", "user2_id");

-- CreateIndex
CREATE UNIQUE INDEX "seo_pages_path_key" ON "public"."seo_pages"("path");

-- CreateIndex
CREATE INDEX "seo_pages_path_idx" ON "public"."seo_pages"("path");

-- CreateIndex
CREATE INDEX "seo_pages_is_active_idx" ON "public"."seo_pages"("is_active");

-- CreateIndex
CREATE INDEX "seo_pages_priority_idx" ON "public"."seo_pages"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "class_attendance_booking_id_key" ON "public"."class_attendance"("booking_id");

-- CreateIndex
CREATE INDEX "class_attendance_class_id_idx" ON "public"."class_attendance"("class_id");

-- CreateIndex
CREATE INDEX "class_attendance_instructor_id_idx" ON "public"."class_attendance"("instructor_id");

-- CreateIndex
CREATE INDEX "class_attendance_user_id_idx" ON "public"."class_attendance"("user_id");

-- CreateIndex
CREATE INDEX "class_attendance_status_idx" ON "public"."class_attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "student_feedback_booking_id_key" ON "public"."student_feedback"("booking_id");

-- CreateIndex
CREATE INDEX "student_feedback_class_id_idx" ON "public"."student_feedback"("class_id");

-- CreateIndex
CREATE INDEX "student_feedback_instructor_id_idx" ON "public"."student_feedback"("instructor_id");

-- CreateIndex
CREATE INDEX "student_feedback_user_id_idx" ON "public"."student_feedback"("user_id");

-- CreateIndex
CREATE INDEX "student_feedback_overallRating_idx" ON "public"."student_feedback"("overallRating");

-- CreateIndex
CREATE INDEX "instructor_performance_instructor_id_idx" ON "public"."instructor_performance"("instructor_id");

-- CreateIndex
CREATE INDEX "instructor_performance_period_idx" ON "public"."instructor_performance"("period");

-- CreateIndex
CREATE INDEX "instructor_performance_period_start_idx" ON "public"."instructor_performance"("period_start");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_performance_instructor_id_period_period_start_key" ON "public"."instructor_performance"("instructor_id", "period", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "student_engagement_booking_id_key" ON "public"."student_engagement"("booking_id");

-- CreateIndex
CREATE INDEX "student_engagement_user_id_idx" ON "public"."student_engagement"("user_id");

-- CreateIndex
CREATE INDEX "student_engagement_instructor_id_idx" ON "public"."student_engagement"("instructor_id");

-- CreateIndex
CREATE INDEX "student_engagement_class_id_idx" ON "public"."student_engagement"("class_id");

-- CreateIndex
CREATE INDEX "student_engagement_engagementLevel_idx" ON "public"."student_engagement"("engagementLevel");

-- CreateIndex
CREATE INDEX "class_analytics_class_id_idx" ON "public"."class_analytics"("class_id");

-- CreateIndex
CREATE INDEX "class_analytics_instructor_id_idx" ON "public"."class_analytics"("instructor_id");

-- CreateIndex
CREATE INDEX "class_analytics_date_idx" ON "public"."class_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "class_analytics_class_id_date_key" ON "public"."class_analytics"("class_id", "date");

-- AddForeignKey
ALTER TABLE "public"."instructors" ADD CONSTRAINT "instructors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_organizer_user_id_fkey" FOREIGN KEY ("organizer_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_instructors" ADD CONSTRAINT "class_instructors_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_instructors" ADD CONSTRAINT "class_instructors_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_styles" ADD CONSTRAINT "user_styles_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "public"."dance_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_styles" ADD CONSTRAINT "user_styles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_styles" ADD CONSTRAINT "class_styles_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_styles" ADD CONSTRAINT "class_styles_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "public"."dance_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_styles" ADD CONSTRAINT "event_styles_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_styles" ADD CONSTRAINT "event_styles_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "public"."dance_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."forum_posts" ADD CONSTRAINT "forum_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."forum_replies" ADD CONSTRAINT "forum_replies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."forum_replies" ADD CONSTRAINT "forum_replies_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."forum_replies" ADD CONSTRAINT "forum_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."testimonials" ADD CONSTRAINT "testimonials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_profile_dance_styles" ADD CONSTRAINT "user_profile_dance_styles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_profile_dance_styles" ADD CONSTRAINT "user_profile_dance_styles_style_id_fkey" FOREIGN KEY ("style_id") REFERENCES "public"."dance_styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_requests" ADD CONSTRAINT "match_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_requests" ADD CONSTRAINT "match_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_attendance" ADD CONSTRAINT "class_attendance_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_attendance" ADD CONSTRAINT "class_attendance_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_attendance" ADD CONSTRAINT "class_attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_attendance" ADD CONSTRAINT "class_attendance_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_feedback" ADD CONSTRAINT "student_feedback_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_feedback" ADD CONSTRAINT "student_feedback_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_feedback" ADD CONSTRAINT "student_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_feedback" ADD CONSTRAINT "student_feedback_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_performance" ADD CONSTRAINT "instructor_performance_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_engagement" ADD CONSTRAINT "student_engagement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_engagement" ADD CONSTRAINT "student_engagement_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_engagement" ADD CONSTRAINT "student_engagement_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_engagement" ADD CONSTRAINT "student_engagement_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_analytics" ADD CONSTRAINT "class_analytics_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_analytics" ADD CONSTRAINT "class_analytics_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
