-- CreateEnum
CREATE TYPE "TinySyncStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'ENVIADO', 'ERRO', 'IGNORADO');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "nfChave" TEXT,
ADD COLUMN     "nfNumero" TEXT,
ADD COLUMN     "nfUrl" TEXT,
ADD COLUMN     "tinyErro" TEXT,
ADD COLUMN     "tinyLastWebhookAt" TIMESTAMP(3),
ADD COLUMN     "tinyPayload" TEXT,
ADD COLUMN     "tinyPedidoId" TEXT,
ADD COLUMN     "tinyStatus" TEXT,
ADD COLUMN     "tinySyncAt" TIMESTAMP(3),
ADD COLUMN     "tinySyncStatus" "TinySyncStatus" NOT NULL DEFAULT 'PENDENTE';

-- CreateIndex
CREATE INDEX "pedidos_tinySyncStatus_idx" ON "pedidos"("tinySyncStatus");

-- CreateIndex
CREATE INDEX "pedidos_tinyPedidoId_idx" ON "pedidos"("tinyPedidoId");
