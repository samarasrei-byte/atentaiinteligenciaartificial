

# Plano: Entregáveis do IR — Download e Visualização

## Problemas identificados
O usuário completa todo o fluxo mas não tem como **baixar** nada. O resultado existe apenas na tela. Documentos enviados não podem ser revisados.

## Melhorias

### 1. Botão "Baixar Relatório PDF" no tab Resultado
Gerar um PDF client-side (usando `jspdf` + `html2canvas` ou construção manual) com:
- Resumo financeiro (rendimentos, deduções, imposto, restituição)
- Comparação Simplificado vs Completo
- Deduções identificadas
- Fontes de rendimento com IRRF
- Risco de Malha Fina
- Disclaimer legal

**Arquivo**: `src/pages/ContadorIADashboard.tsx` — novo botão + função `handleDownloadPDF()`

### 2. Botão de download/preview nos documentos enviados
Na lista de documentos (tab "Documentos"), adicionar ícone de download que gera URL temporária do storage:
```
supabase.storage.from('ir-ai-documents').createSignedUrl(filePath, 300)
```

**Arquivo**: `src/pages/ContadorIADashboard.tsx` — na seção de documentos

### 3. Dependências
- Instalar `jspdf` para geração de PDF client-side
- Nenhuma alteração no backend

## Arquivos alterados
- `src/pages/ContadorIADashboard.tsx` (2 seções: resultado + documentos)
- `package.json` (adicionar jspdf)

## Estimativa
- 3 alterações no mesmo arquivo principal
- Sem risco para lógica existente

