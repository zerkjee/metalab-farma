-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_idempotencyKey_key" ON "pedidos"("idempotencyKey");
