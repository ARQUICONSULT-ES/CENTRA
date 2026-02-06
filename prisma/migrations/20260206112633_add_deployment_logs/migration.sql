/*
  Warnings:

  - A unique constraint covering the columns `[customerName]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "latest_prerelease_date" TIMESTAMP(3),
ADD COLUMN     "latest_prerelease_version" VARCHAR(100);

-- CreateTable
CREATE TABLE "deployment_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "environment_name" VARCHAR(50) NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "total_apps" INTEGER NOT NULL,
    "successful_apps" INTEGER NOT NULL DEFAULT 0,
    "failed_apps" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,

    CONSTRAINT "deployment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_log_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deployment_id" UUID NOT NULL,
    "application_id" UUID,
    "app_name" VARCHAR(255) NOT NULL,
    "app_type" VARCHAR(20) NOT NULL,
    "version" VARCHAR(100) NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL,
    "pr_number" INTEGER,
    "install_mode" VARCHAR(20),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "downloaded_size_kb" DOUBLE PRECISION,
    "error_message" TEXT,

    CONSTRAINT "deployment_log_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deployment_logs_user_id_idx" ON "deployment_logs"("user_id");

-- CreateIndex
CREATE INDEX "deployment_logs_customer_id_idx" ON "deployment_logs"("customer_id");

-- CreateIndex
CREATE INDEX "deployment_logs_tenant_id_environment_name_idx" ON "deployment_logs"("tenant_id", "environment_name");

-- CreateIndex
CREATE INDEX "deployment_logs_created_at_idx" ON "deployment_logs"("created_at");

-- CreateIndex
CREATE INDEX "deployment_log_details_deployment_id_idx" ON "deployment_log_details"("deployment_id");

-- CreateIndex
CREATE INDEX "deployment_log_details_application_id_idx" ON "deployment_log_details"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerName_key" ON "customers"("customerName");

-- AddForeignKey
ALTER TABLE "deployment_logs" ADD CONSTRAINT "deployment_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_log_details" ADD CONSTRAINT "deployment_log_details_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "deployment_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployment_log_details" ADD CONSTRAINT "deployment_log_details_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
