ALTER TABLE "categories"
ADD COLUMN "image_url" TEXT;

ALTER TABLE "products"
ADD COLUMN "season" TEXT,
ADD COLUMN "edition" TEXT;
