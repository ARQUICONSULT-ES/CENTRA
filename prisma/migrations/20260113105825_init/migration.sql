-- CreateEnum
CREATE TYPE "InfrastructureType" AS ENUM ('Saas', 'OnPremise');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "github_token" TEXT,
    "github_avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "can_access_repos" BOOLEAN NOT NULL DEFAULT false,
    "can_access_customers" BOOLEAN NOT NULL DEFAULT false,
    "all_customers" BOOLEAN NOT NULL DEFAULT false,
    "can_access_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerName" VARCHAR(50) NOT NULL,
    "imageBase64" TEXT,
    "infraestructureType" "InfrastructureType" NOT NULL DEFAULT 'Saas',

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_customers" (
    "userId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_customers_pkey" PRIMARY KEY ("userId","customerId")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "connectionId" UUID,
    "grantType" VARCHAR(100),
    "clientId" UUID,
    "clientSecret" TEXT,
    "scope" VARCHAR(200),
    "token" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environments" (
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "type" VARCHAR(50),
    "status" VARCHAR(50),
    "webClientUrl" VARCHAR(1000),
    "locationName" VARCHAR(50),
    "applicationVersion" VARCHAR(50),
    "platformVersion" VARCHAR(50),

    CONSTRAINT "environments_pkey" PRIMARY KEY ("tenantId","name")
);

-- CreateTable
CREATE TABLE "installed_apps" (
    "tenantId" UUID NOT NULL,
    "environmentName" VARCHAR(100) NOT NULL,
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "version" VARCHAR(100) NOT NULL,
    "publisher" VARCHAR(255) NOT NULL,
    "publishedAs" VARCHAR(20) NOT NULL,
    "state" VARCHAR(50),

    CONSTRAINT "installed_apps_pkey" PRIMARY KEY ("tenantId","environmentName","id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "publisher" VARCHAR(255) NOT NULL,
    "github_repo_name" VARCHAR(255) NOT NULL,
    "github_url" VARCHAR(500),
    "latest_release_version" VARCHAR(100),
    "latest_release_date" TIMESTAMP(3),
    "logo_base64" TEXT,
    "id_ranges" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "user_customers" ADD CONSTRAINT "user_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_customers" ADD CONSTRAINT "user_customers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environments" ADD CONSTRAINT "environments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installed_apps" ADD CONSTRAINT "installed_apps_tenantId_environmentName_fkey" FOREIGN KEY ("tenantId", "environmentName") REFERENCES "environments"("tenantId", "name") ON DELETE CASCADE ON UPDATE CASCADE;
