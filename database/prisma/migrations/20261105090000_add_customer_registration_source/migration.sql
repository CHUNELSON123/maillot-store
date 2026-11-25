ALTER TABLE "customers"
ADD COLUMN "registration_source" TEXT NOT NULL DEFAULT 'UNKNOWN';

ALTER TABLE "customers"
ALTER COLUMN "registration_source" SET DEFAULT 'WEBSITE';
