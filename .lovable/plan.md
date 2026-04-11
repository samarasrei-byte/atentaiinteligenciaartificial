

# Plano: Melhorias no resultado do IR para o usuário

## Contexto
O pipeline de IA do IR está funcional e robusto. Porém, 3 dados calculados pelo backend não chegam ao usuário no frontend.

## Melhorias propostas

### 1. Exibir comparação Simplificado vs Completo
O backend já calcula e salva `model_comparison` com deduções, base de cálculo e imposto de ambos os modelos. Criar um card visual no tab "Resultado" mostrando:
- Simplificado: deduções → base → imposto
- Completo: deduções → base → imposto  
- Economia escolhida

**Arquivo**: `src/pages/ContadorIADashboard.tsx` (tab "result", após o card de recomendação)

### 2. Mostrar IRRF retido por fonte pagadora
Na seção "Fontes de Rendimento", adicionar coluna/linha com `irrf_cents` de cada fonte, para o usuário ver quanto foi retido em cada emprego/fonte.

**Arquivo**: `src/pages/ContadorIADashboard.tsx` (seção `income_sources`)

### 3. Nenhuma alteração no backend
O Edge Function `ai-ir-analyze` já calcula e persiste todos os dados necessários. As melhorias são 100% frontend.

## Estimativa
- 2 alterações no mesmo arquivo (`ContadorIADashboard.tsx`)
- Sem risco de quebrar lógica existente

