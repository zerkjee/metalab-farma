-- CreateIndex
CREATE INDEX "avaliacoes_produtoId_aprovada_idx" ON "avaliacoes"("produtoId", "aprovada");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_usuarioId_produtoId_key" ON "avaliacoes"("usuarioId", "produtoId");

-- CreateIndex
CREATE INDEX "produtos_ativo_destaque_idx" ON "produtos"("ativo", "destaque");

-- CreateIndex
CREATE INDEX "produtos_ativo_categoriaId_idx" ON "produtos"("ativo", "categoriaId");
