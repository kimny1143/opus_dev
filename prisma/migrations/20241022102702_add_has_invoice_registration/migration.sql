-- DropIndex
DROP INDEX "Client_contactEmail_key";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "hasInvoiceRegistration" BOOLEAN NOT NULL DEFAULT false;
