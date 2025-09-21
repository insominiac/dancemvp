-- CreateTable
CREATE TABLE "public"."login_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "purpose" TEXT,
    "created_by_user_id" TEXT,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "allowed_roles" TEXT[],
    "metadata" TEXT,
    "last_used_at" TIMESTAMP(3),
    "last_used_ip" TEXT,
    "last_user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_attempts" (
    "id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "email" TEXT,
    "success" BOOLEAN NOT NULL,
    "failure_reason" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "user_id" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_tokens_token_key" ON "public"."login_tokens"("token");

-- CreateIndex
CREATE INDEX "login_tokens_token_idx" ON "public"."login_tokens"("token");

-- CreateIndex
CREATE INDEX "login_tokens_created_by_user_id_idx" ON "public"."login_tokens"("created_by_user_id");

-- CreateIndex
CREATE INDEX "login_tokens_is_active_idx" ON "public"."login_tokens"("is_active");

-- CreateIndex
CREATE INDEX "login_tokens_expires_at_idx" ON "public"."login_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "login_tokens_purpose_idx" ON "public"."login_tokens"("purpose");

-- CreateIndex
CREATE INDEX "login_attempts_token_id_idx" ON "public"."login_attempts"("token_id");

-- CreateIndex
CREATE INDEX "login_attempts_user_id_idx" ON "public"."login_attempts"("user_id");

-- CreateIndex
CREATE INDEX "login_attempts_success_idx" ON "public"."login_attempts"("success");

-- CreateIndex
CREATE INDEX "login_attempts_created_at_idx" ON "public"."login_attempts"("created_at");

-- AddForeignKey
ALTER TABLE "public"."login_tokens" ADD CONSTRAINT "login_tokens_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_attempts" ADD CONSTRAINT "login_attempts_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."login_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
