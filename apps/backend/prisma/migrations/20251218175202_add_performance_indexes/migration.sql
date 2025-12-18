-- CreateIndex
CREATE INDEX "agendamentos_data_agendamento_idx" ON "agendamentos"("data_agendamento");

-- CreateIndex
CREATE INDEX "agendamentos_barbeiro_id_idx" ON "agendamentos"("barbeiro_id");

-- CreateIndex
CREATE INDEX "agendamentos_cliente_id_idx" ON "agendamentos"("cliente_id");

-- CreateIndex
CREATE INDEX "agendamentos_status_idx" ON "agendamentos"("status");

-- CreateIndex
CREATE INDEX "agendamentos_data_agendamento_barbeiro_id_idx" ON "agendamentos"("data_agendamento", "barbeiro_id");

-- CreateIndex
CREATE INDEX "agendamentos_data_agendamento_status_idx" ON "agendamentos"("data_agendamento", "status");

-- CreateIndex
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_email_idx" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");

-- CreateIndex
CREATE INDEX "clientes_ativo_idx" ON "clientes"("ativo");

-- CreateIndex
CREATE INDEX "servicos_ativo_idx" ON "servicos"("ativo");

-- CreateIndex
CREATE INDEX "servicos_nome_idx" ON "servicos"("nome");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_ativo_idx" ON "usuarios"("ativo");

-- CreateIndex
CREATE INDEX "usuarios_tipo_idx" ON "usuarios"("tipo");
