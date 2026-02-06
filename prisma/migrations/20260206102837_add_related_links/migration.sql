-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('Customer');

-- CreateTable
CREATE TABLE "related_links" (
    "relation_type" "RelationType" NOT NULL,
    "relation_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "favicon" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "related_links_pkey" PRIMARY KEY ("relation_type","relation_id","url")
);
