

# Plano: Integrar IR no Painel Principal com Chat de Documentos

## Situação Atual
- Após pagar o IR, o usuário é redirecionado para `/contador-ia` — um painel **isolado** e separado do dashboard principal
- O usuário perde acesso aos outros serviços (Limpa Nome, Análise Fiscal, NF, etc.)
- O usuário precisa criar senha separadamente em alguns fluxos

## O que vai mudar

### 1. Adicionar "Imposto de Renda" na sidebar do painel principal
Nos grupos de serviços do `AppSidebar.tsx`, adicionar item "Imposto de Renda" com tabId `'ir-declaracao'` nos perfis Empresa, Autônomo e User.

### 2. Criar tab IR dentro do Dashboard (EmpresaPanel)
Mover a lógica core do `ContadorIADashboard.tsx` (upload de documentos, checklist, análise IA, resultado com PDF) para um novo componente `src/components/ir/IRDashboardTab.tsx` que será renderizado como uma tab dentro do painel principal.

### 3. Auto-abrir tab IR após pagamento
- Alterar os redirecionamentos pós-pagamento de `/contador-ia` para `/empresa?tab=ir-declaracao` (ou `/autonomo?tab=ir-declaracao`)
- Arquivos: `CheckoutSuccessPage.tsx`, `IRPage.tsx`, `IRRequestForm.tsx`

### 4. AutoOpenChat detecta IR ativo
Atualizar `AutoOpenChatWrapper.tsx` para verificar `ir_ai_declarations` (não apenas `ir_requests`) e setar a tab `ir-declaracao` automaticamente quando o usuário entra no painel com uma declaração ativa.

### 5. Manter `/contador-ia` como redirect
Manter a rota mas redirecionar para `/empresa?tab=ir-declaracao` para não quebrar links existentes.

## Resultado para o usuário
1. Paga o IR → vai pro painel principal
2. O chat/tab do IR abre automaticamente com upload de documentos
3. Todos os outros serviços continuam acessíveis na sidebar
4. Sem necessidade de criar senha extra (já está logado pelo fluxo de pagamento)

## Arquivos alterados
- `src/components/layout/AppSidebar.tsx` — adicionar item IR na sidebar
- `src/components/ir/IRDashboardTab.tsx` — **novo** componente extraído do ContadorIADashboard
- `src/pages/EmpresaPanel.tsx` — renderizar tab `ir-declaracao`
- `src/pages/CheckoutSuccessPage.tsx` — redirecionar para dashboard
- `src/pages/IRPage.tsx` — redirecionar para dashboard
- `src/components/ir/IRRequestForm.tsx` — atualizar redirect
- `src/components/chat/AutoOpenChatWrapper.tsx` — detectar IR ativo em `ir_ai_declarations`
- `src/pages/ContadorIADashboard.tsx` — converter em redirect para `/empresa?tab=ir-declaracao`

