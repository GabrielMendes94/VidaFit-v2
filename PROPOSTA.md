# Proposta - VidaFit

## Visão geral
VidaFit é uma aplicação web voltada para ajudar usuários a manter uma rotina de exercícios e hábitos saudáveis. O objetivo é oferecer um espaço simples para registrar treinos, controlar consumo de água, definir metas diárias e acompanhar a evolução por gráficos. O produto é um MVP (aplicação estática) que armazena dados localmente no navegador.

## Regras de negócio
- Cada usuário é identificado por email. Senhas são armazenadas localmente (hash simples apenas para distinção — não seguro para produção).
- Usuário pode criar uma conta (email, nome, senha) e fazer login. Sessão simples é persistida em `localStorage`.
- Usuário pode registrar treinos com: data, tipo, duração (minutos) e notas.
- Usuário pode registrar entradas de consumo de água (ml) por data.
- Usuário pode definir metas de água diária, quantidade de treinos por semana e intervalo para lembretes.
- Dados são separados por usuário (chave por email em `vf_users`) e permanecem no navegador do usuário.
- O usuário pode editar e excluir treinos e registros de água.
- O app exibe gráficos dos últimos 7 dias para água e duração de treinos.
- O app envia lembretes via Notification API (se permitido pelo navegador).

## Requisitos funcionais implementados
1. Registro de conta — formulário de criação de conta, validações mínimas e armazenamento em `localStorage`.
2. Autenticação básica — login por email/senha e persistência de sessão em `localStorage`.
3. CRUD de treinos — criar, listar, editar e excluir treinos (data, tipo, duração, notas).
4. CRUD de água — criar, listar, editar e excluir registros de consumo de água.
5. Metas — salvar metas de água diária, treinos por semana e intervalo de lembretes.
6. Dashboard — resumo com água do dia e treinos da semana.
7. Gráficos — visualização com Chart.js dos últimos 7 dias para água e treinos (duração).
8. Lembretes — envio de notificações usando Notification API (permissão do usuário necessária).
9. Feedback e depuração — mensagens de sucesso (alerts), painel de debug e botão de reset de dados locais.

## Requisitos não funcionais
- Armazenamento local: os dados do MVP são salvos em `localStorage`, garantindo funcionamento offline e baixo tempo de resposta.
- Simplicidade e portabilidade: aplicação estática (HTML/CSS/JS) que pode ser publicada em GitHub Pages ou qualquer host estático.
- Performance: aplicação sem dependências de backend, mínima sobrecarga, carregamento via CDN para Chart.js (pode ser baixado localmente para evitar bloqueios).
- Segurança: autenticação local leve — adequada apenas para demonstração; não adequada para produção. Senhas são "hasheadas" de forma simples apenas para separação (não seguro).
- Usabilidade: UI responsiva básica, design escuro por padrão com foco em acessibilidade mínima (contrast). Melhorias de UX podem ser adicionadas.
- Testabilidade: sem suíte de testes por enquanto; recomenda-se adicionar testes unitários e integrações para o backend futuro.

## Publicação
- Publicar o conteúdo em um repositório Git e habilitar GitHub Pages (branch `main` ou `gh-pages`) para hospedagem estática.

## Próximos passos recomendados
- Mudar armazenamento para backend (API) com autenticação segura (JWT/bcrypt) e banco de dados (SQLite/Postgres).
- Adicionar toasts e melhorias de UX (substituir alerts), validação mais robusta dos formulários e mensagens inline.
- Implementar export/import de dados do usuário (JSON/CSV) para backup.
- Adicionar testes (Jest) e linter (ESLint), configurar CI.

*Documento gerado automaticamente a pedido do usuário.*
