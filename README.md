# VidaFit — Plataforma de Treinos e Hábitos (MVP)

Projeto de escopo curto (Vibe and Build) — aplicativo web estático em 2 horas.

Resumo
------
VidaFit é uma aplicação web simples para ajudar usuários a organizar treinos e hábitos saudáveis (registro de treinos, consumo de água, metas diárias, gráficos e lembretes). Os dados são salvos no navegador (localStorage) e cada usuário tem seus próprios dados.

Entregável e publicação
-----------------------
- Produto: aplicação web estática pronta (arquivos HTML/CSS/JS).
- Local de publicação recomendado: GitHub Pages (deploy direto do repositório). Também funciona hospedando os arquivos em qualquer servidor estático.

Regras de negócio (proposta)
----------------------------
- Usuário cria conta com email e senha (armazenado localmente, hashing simples no client).
- Usuário registra treinos (data, tipo, duração, notas).
- Usuário registra consumo de água por entrada (ml) com data.
- Usuário define metas diárias (meta de água, treinos por semana, intervalo de lembrete).
- Dados são privados no navegador e separados por email do usuário.

Requisitos funcionais implementados
-----------------------------------
1. Criar conta (registro) — implementado (formulário em `index.html`, armazenamento em `localStorage`).
2. Entrar com conta — implementado (formulário de login, sessão armazenada em `localStorage`).
3. Registrar treinos — implementado (formulário `workoutForm`).
4. Registrar consumo de água — implementado (formulário `waterForm`).
5. Definir metas diárias — implementado (formulário `goalsForm`).
6. Acompanhar evolução por gráficos — implementado com Chart.js (últimos 7 dias para água e treino).
7. Receber lembretes — implementado usando Notification API do navegador (permissão necessária).

Requisitos não funcionais
-------------------------
- Desempenho: app estático rápido; todas as operações são locales (sem rede).
- Segurança: autenticação local leve; hashing simples apenas para MVP — não segura para produção.
- Usabilidade: UI simples, responsiva (grid que se adapta a mobile).
- Portabilidade: funciona em qualquer navegador moderno que suporte localStorage e Notification API.

Estrutura de arquivos
---------------------
- `index.html` — interface e formulários.
- `style.css` — estilos.
- `app.js` — lógica do aplicativo (autenticação, CRUD, gráficos, lembretes).

Como executar localmente
------------------------
1. Abra `index.html` no navegador (duplo-clique ou arraste para a janela do navegador).
2. Registre uma conta e comece a usar.

Publicar no GitHub Pages
------------------------
1. Crie um repositório no GitHub e faça push dos arquivos.
2. Nas configurações do repositório (Settings → Pages), selecione a branch `main` (ou `gh-pages`) e a pasta `/` (root).
3. O site será publicado no endereço indicado (ex: `https://seu-usuario.github.io/seu-repo`).

Notas e próximos passos recomendados
----------------------------------
- Melhorar segurança: mover autenticação para backend real, hashing/criptografia segura.
- Sincronização: adicionar backend para sincronizar dados entre dispositivos.
- UX: adicionar gráficos mais ricos, filtros, exportação de dados e histórico.
