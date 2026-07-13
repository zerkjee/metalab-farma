-- Add missing foreign-key indexes (additive, idempotent).
-- Index names follow Prisma's default convention: <table>_<column>_idx

-- CreateIndex
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "imagens_produto_produtoId_idx" ON "imagens_produto"("produtoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "atributos_produto_produtoId_idx" ON "atributos_produto"("produtoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "kit_itens_produtoId_idx" ON "kit_itens"("produtoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "enderecos_usuarioId_idx" ON "enderecos"("usuarioId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pedidos_cupomId_idx" ON "pedidos"("cupomId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pedidos_enderecoId_idx" ON "pedidos"("enderecoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "itens_pedido_pedidoId_idx" ON "itens_pedido"("pedidoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "itens_pedido_produtoId_idx" ON "itens_pedido"("produtoId");
