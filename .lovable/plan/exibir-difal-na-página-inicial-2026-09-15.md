# Exibir DIFAL na página inicial

## Diagnóstico
- A rota `/difal` existe e responde corretamente, mas é protegida: visitantes sem login são encaminhados para Entrar.
- A página inicial ainda não possui um atalho visível para o DIFAL, por isso o módulo parece indisponível.
- Endereços com `*` são apenas uma notação de conjunto de rotas; o link real deve ser `/difal` ou uma página específica, como `/difal/nova-simulacao`.

## Alterações
1. Adicionar “DIFAL Marketplace” à navegação principal, no computador e no celular.
2. Adicionar um card do DIFAL na área de serviços da página inicial, com acesso direto a `/difal`.
3. Preservar a proteção por login; após entrar, o usuário retorna ao módulo.
4. Validar no site local em desktop e celular, incluindo o redirecionamento para login.

## Detalhes técnicos
- Reutilizar os botões, cards, tokens visuais e navegação existentes.
- Não alterar regras de cálculo, banco de dados ou demais serviços.
