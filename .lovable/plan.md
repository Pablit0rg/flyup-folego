# FlyUp — MVP de validação

Implementação estrita da especificação. Todo texto em pt-BR, sem imagens geradas, sem pagamento, IA, Open Finance ou e-mails.

## Páginas

1. **Landing (/)** — título "Quantos meses você aguenta se der o salto?", subtítulo (reserva ÷ custo de vida), "Como funciona" em 3 passos, seção "Seus números ficam com você", botão principal para /calculadora.
2. **Calculadora (/calculadora)** — campos custo de vida mensal, reserva atual e (opcional) quanto guarda por mês, em R$.
   - Meses de fôlego = reserva ÷ custo de vida, 1 casa decimal.
   - Se fôlego >= 6: mostra "Você já tem 6 meses ou mais de fôlego." e nenhuma estimativa.
   - Senão, se guardado por mês > 0: mostra estimativa (rótulo "estimativa") de meses até 6 meses de fôlego = ceil((6 × custo − reserva) ÷ guardado). Vazio ou zero: sem estimativa.
   - Aviso fixo "Isto não é recomendação de investimento."
   - Após o resultado: botão "Quer ajuda para montar seu plano de transição?" que abre o formulário (diálogo).
3. **Formulário de contato** (diálogo dentro da calculadora) — nome, WhatsApp, carreira-alvo (opcional), consentimento obrigatório com o texto exato, honeypot invisível. Após salvar, abre `https://wa.me/<NUMERO>?text=<mensagem codificada>`.
4. **Admin (/admin)** — login por e-mail e senha (sem cadastro), lista de leads com troca de status e campo único de observações, três contadores (cálculos, cliques de ajuda, leads).

Visual: mobile-first, fundo claro, azul-petróleo #0F3D4C como primária, verde #2BB673 para progresso, definidos como tokens de tema.

## Banco de dados (Lovable Cloud)

**`app_role`** (enum): `admin`.

**`user_roles`** — `id`, `user_id` (ref. auth.users, cascade), `role`, único (user_id, role).
- RLS ligado. SELECT para `authenticated` apenas da própria linha (`user_id = auth.uid()`). Sem INSERT/UPDATE/DELETE para nenhum papel do app; só via painel/SQL.

**Função `has_role(_user_id, _role)`** — `security definer`, `stable`, `search_path = public`; usada em todas as políticas de admin (evita recursão de RLS).

**`leads`** — `id`, `nome` (texto, 1–100), `whatsapp` (texto, 10–15 dígitos), `carreira_alvo` (texto opcional, até 100), `consentimento` (boolean, check = true), `status` (enum `lead_status`: novo, em_contato, acompanhando, descartado; padrão novo), `observacoes` (texto opcional), `created_at`. Nenhuma coluna financeira.
- INSERT para `anon` e `authenticated` com `WITH CHECK (consentimento = true AND status = 'novo' AND observacoes IS NULL)`.
- SELECT e UPDATE apenas `has_role(auth.uid(), 'admin')`. Sem DELETE.

**`eventos`** — `id`, `tipo` (check em 'calculo_feito', 'clique_ajuda', 'lead_enviado'), `created_at`. Nada além disso.
- INSERT para `anon` e `authenticated` (check do tipo).
- SELECT apenas admin. Sem UPDATE/DELETE.

Grants explícitos em cada tabela conforme as políticas (INSERT a anon; SELECT/UPDATE a authenticated; tudo a service_role).

## Papel de administrador

- Sem tela ou chamada de cadastro; signup público desligado nas configurações de autenticação; login por e-mail/senha ativado.
- Você cria o usuário no painel do Cloud (Users); em seguida a linha `(user_id, 'admin')` é inserida em `user_roles` via SQL — nunca em perfil ou metadados.
- Verificação: no banco, pelas políticas RLS com `has_role`. Na interface, /admin consulta `has_role` só para decidir o que exibir; um usuário logado sem papel vê "Acesso negado" e não recebe dados, pois o RLS bloqueia.

## Nenhum valor financeiro sai do navegador

- Os três valores ficam apenas em estado React local da calculadora; não vão para URL, localStorage, cookies nem nenhuma requisição.
- O evento `calculo_feito` envia somente `{ tipo }`; a tabela não tem coluna para valores.
- O formulário de lead envia somente nome, WhatsApp, carreira-alvo e consentimento; o texto do WhatsApp é fixo, sem números.
- A calculadora não tem loader nem server function; o cálculo é uma função pura no cliente.

## Constante do WhatsApp

`src/config/flyup.ts` com `WHATSAPP_NUMBER = "5500000000000"` (só dígitos) e `WHATSAPP_MESSAGE`. Único lugar a trocar antes de publicar.

## Detalhes técnicos

- Envio do lead: server function pública valida com zod, descarta silenciosamente se o honeypot vier preenchido (responde sucesso sem gravar), insere com cliente publicável (sem `select` de retorno, já que anon não lê) e registra `lead_enviado`. O WhatsApp abre após sucesso.
- Eventos `calculo_feito` e `clique_ajuda`: insert direto pelo cliente do navegador, só com `tipo`.
- /admin: página client-side com cliente do navegador (RLS como o usuário); contadores via `count` com `head: true` por tipo de evento e total de leads.
- Sessão: listener único no root; botão sair limpa cache e sessão.
- Sem chaves no código; somente variáveis de ambiente fornecidas pelo Cloud.
- head() próprio em /, /calculadora e /admin (admin com noindex).
