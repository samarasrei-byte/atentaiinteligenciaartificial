# DIFAL Marketplace — novo módulo dentro do AtentAI

Módulo brasileiro de simulação, análise e gestão do DIFAL em operações interestaduais, adicionado ao AtentAI sem remover nada do que já existe. Reaproveita login, identidade visual, menu e componentes atuais.

## Aviso obrigatório

Todo resultado de cálculo e todo relatório exibem:

"Este resultado é uma estimativa baseada nos parâmetros e regras cadastrados no sistema. Ele não substitui a validação de um contador, advogado tributarista ou responsável fiscal."

As regras iniciais entram marcadas como **demonstrativas**, com selo visível, até que um administrador as revise e publique.

## Navegação

Novo item "DIFAL Marketplace" no menu autenticado, abrindo uma área própria em `/difal` com as seções:

Dashboard · Nova simulação · Histórico · Comparar estados · Regras por estado (admin) · Produtos e NCM · Alertas legislativos · Relatórios · Configurações

Rotas protegidas pelo mesmo controle de acesso já usado no projeto. As telas de regras, alertas e configurações exigem perfil administrador.

## Telas

**Dashboard** — total de simulações, DIFAL e FCP estimados no período, estados de destino mais usados, últimas simulações, alertas recentes, gráfico mensal e filtros por período, empresa e estado. Botão "Nova simulação".

**Nova simulação** — formulário em 4 etapas: dados da operação (datas, UFs, tipo, finalidade, contribuinte, regimes, canal, responsável), valores (produtos, frete, seguro, despesas, descontos, comissão), produtos (vários itens com NCM, CEST, CFOP, ST, FCP, busca por NCM) e revisão editável. Ações: calcular, salvar rascunho, limpar, cancelar.

**Resultado** — base de cálculo, alíquotas interestadual e interna, percentual e valor de DIFAL, FCP, total, responsável pelo recolhimento, vigência e fonte da regra, observações e nível de confiança. Seção "Memória de cálculo" mostrando passo a passo, sem esconder parâmetros.

**Histórico** — tabela com número, data, usuário, empresa, UFs, valores, status e data da regra; ações visualizar, editar, duplicar, exportar e arquivar; busca, filtros e ordenação.

**Comparar estados** — mesma operação em vários destinos, com tabela comparativa, diferenças e gráfico de barras.

**Regras por estado** — área administrativa cobrindo os 26 estados e o DF, com todos os campos de regra, vigências, fonte, norma, responsável, observações e status (rascunho, ativo, arquivado), além de filtros.

**Relatórios** — exportação em PDF da simulação com logo e dados da empresa, operação, itens, parâmetros, regras, memória de cálculo, resultado, fontes, data/hora, usuário e o aviso de estimativa.

**Empresas** — cadastro com razão social, nome fantasia, CNPJ, IE, UF, regime, atividade, responsável fiscal e logo.

## Perfis de acesso

- Administrador: usuários, empresas, regras, alertas, todas as simulações permitidas e logs.
- Contador/analista: cria simulações, consulta regras, gera relatórios e vê o histórico das empresas autorizadas.
- Usuário empresarial: cria simulações, vê o próprio histórico e gera relatórios; não altera regras.

Cada empresa só enxerga os próprios dados.

## Detalhes técnicos

**Banco (Lovable Cloud):** novas tabelas com prefixo `difal_` para não colidir com tabelas atuais (`companies`, `audit_logs` já existem): `difal_companies`, `difal_company_users`, `difal_states`, `difal_tax_rules`, `difal_tax_rule_sources`, `difal_products`, `difal_product_tax_data`, `difal_simulations`, `difal_simulation_items`, `difal_calculation_results`, `difal_legislative_alerts`, `difal_rule_audit_logs`. Cada tabela criada com GRANTs explícitos, RLS ativa e políticas por empresa/perfil. Papel novo `difal_admin` não é necessário: usa `has_role(auth.uid(),'admin')` e `contador` já existentes, mais vínculo empresa-usuário.

**Motor de cálculo:** `src/lib/difal/` puro em TypeScript (`engine.ts`, `types.ts`, `resolveRule.ts`, `formatters.ts`), sem alíquotas embutidas na interface — todas vêm de `difal_tax_rules` com vigência por data. Sem regra aplicável ou dado obrigatório ausente, retorna um resultado de "revisão necessária" com o motivo, nunca um número inventado.

**Trigger de auditoria** em `difal_tax_rules` registra usuário, data, campo, valor anterior, valor novo e motivo.

**Testes** do motor com Vitest: UFs diferentes, sem regra, com FCP, múltiplos itens, desconto, frete, seguro, tipos de destinatário, vigências distintas, regra arquivada e dados incompletos.

**PDF** via jsPDF, já usado no projeto.

## Entrega em fases

1. Banco + motor de cálculo + testes
2. Rotas, menu e layout do módulo (dashboard, nova simulação, resultado com memória de cálculo)
3. Histórico, comparar estados, produtos/NCM, alertas
4. Área administrativa de regras, empresas, relatórios PDF e configurações

Sem integrações externas nesta versão (sem ERP, SEFAZ, NF-e, XML/CSV) — apenas preenchimento manual, com a arquitetura preparada para adicioná-las depois.
