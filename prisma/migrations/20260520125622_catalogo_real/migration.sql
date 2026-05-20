-- CreateEnum
CREATE TYPE "TipoProduto" AS ENUM ('SIMPLES', 'KIT');

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "alturaCm" INTEGER,
ADD COLUMN     "composicao" TEXT,
ADD COLUMN     "comprimentoCm" INTEGER,
ADD COLUMN     "larguraCm" INTEGER,
ADD COLUMN     "modoDeUso" TEXT,
ADD COLUMN     "pesoGramas" INTEGER,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "tipo" "TipoProduto" NOT NULL DEFAULT 'SIMPLES';

-- CreateTable
CREATE TABLE "kit_itens" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "kitId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,

    CONSTRAINT "kit_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kit_itens_kitId_idx" ON "kit_itens"("kitId");

-- CreateIndex
CREATE UNIQUE INDEX "kit_itens_kitId_produtoId_key" ON "kit_itens"("kitId", "produtoId");

-- CreateIndex
CREATE INDEX "produtos_tipo_idx" ON "produtos"("tipo");

-- AddForeignKey
ALTER TABLE "kit_itens" ADD CONSTRAINT "kit_itens_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_itens" ADD CONSTRAINT "kit_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
