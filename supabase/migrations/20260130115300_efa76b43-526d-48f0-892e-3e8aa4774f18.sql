-- Índices para escala 100k+ na tabela audit_logs
-- Otimiza consultas frequentes no painel de auditoria

-- Índice para filtros por usuário (muito comum em auditorias)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Índice para ordenação cronológica (padrão em listagens)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Índice composto para filtros combinados (user + data)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);

-- Índice para tipo de ação (filtros frequentes)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);

-- Índice para sucesso/falha (análise de segurança)
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON public.audit_logs(success);

-- Índice composto para dashboard de segurança (ações falhas recentes)
CREATE INDEX IF NOT EXISTS idx_audit_logs_security ON public.audit_logs(success, created_at DESC) WHERE success = false;

-- Índice para rotas acessadas (análise de comportamento)
CREATE INDEX IF NOT EXISTS idx_audit_logs_route ON public.audit_logs(route_attempted) WHERE route_attempted IS NOT NULL;

-- Índice para busca em metadata (JSONB - para queries específicas)
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON public.audit_logs USING GIN(metadata);

-- Comentário explicativo
COMMENT ON INDEX idx_audit_logs_user_id IS 'Otimiza consultas por usuário específico';
COMMENT ON INDEX idx_audit_logs_created_at IS 'Otimiza ordenação cronológica DESC';
COMMENT ON INDEX idx_audit_logs_user_created IS 'Otimiza filtros user+data combinados';
COMMENT ON INDEX idx_audit_logs_action_type IS 'Otimiza filtros por tipo de ação';
COMMENT ON INDEX idx_audit_logs_success IS 'Otimiza análise de sucesso/falha';
COMMENT ON INDEX idx_audit_logs_security IS 'Índice parcial para falhas de segurança';
COMMENT ON INDEX idx_audit_logs_route IS 'Índice parcial para análise de rotas';
COMMENT ON INDEX idx_audit_logs_metadata IS 'Índice GIN para queries JSONB';