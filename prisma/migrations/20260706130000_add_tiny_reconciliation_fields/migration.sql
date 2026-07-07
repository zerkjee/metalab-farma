-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "nfEmitidaEm" TIMESTAMP(3),
ADD COLUMN     "nfStatus" TEXT,
ADD COLUMN     "nfXmlUrl" TEXT,
ADD COLUMN     "tinyNumero" TEXT;
