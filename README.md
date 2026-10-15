# Jobs API (MVP)

API de vagas para devs iniciantes. Node (ES Modules), Express 5, PostgreSQL (`pg`), Zod, bcryptjs, JWT (`jsonwebtoken`), express-rate-limit e dotenv.

## Como rodar

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
psql $DATABASE_URL -f database/schema.sql
npm run dev                 # desenvolvimento (reinicia ao salvar)
npm start                   # produção
```

Variáveis do `.env`:

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão `3000`) |
| `DATABASE_URL` | Ex.: `postgres://usuario:senha@localhost:5432/jobs_db` |
| `JWT_SECRET` | Chave secreta para assinar os tokens |
| `JWT_EXPIRES_IN` | Validade do token (padrão `1d`) |
| `CORS_ORIGIN` | Origem permitida (padrão `*`) |

## Estrutura

```
src/
  server.js, app.js
  config/       conexão com o Postgres
  utils/        AppError (erro com status HTTP)
  middlewares/  auth (JWT + role), rateLimit, errorHandler
  schemas/      validações Zod (usadas nos controllers)
  models/       SQL
  controllers/  lógica de cada rota
  routes/       URLs (auth('role') nas rotas protegidas)
```

## Autenticação e papéis

- Rotas protegidas exigem o header `Authorization: Bearer <token>` (o token vem do login).
- Papéis: `dev` (se candidata) e `recruiter` (gerencia vagas e candidaturas).
- Sem token ou token inválido/expirado: **401**. Papel sem permissão: **403**.

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/register` | público |
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | logado |
| GET | `/api/jobs` | público |
| GET | `/api/jobs/:id` | público |
| POST | `/api/jobs` | recruiter |
| PATCH | `/api/jobs/:id` | recruiter |
| DELETE | `/api/jobs/:id` | recruiter |
| GET | `/api/jobs/:id/applications` | recruiter |
| POST | `/api/applications` | dev |
| GET | `/api/applications/me` | dev |
| PATCH | `/api/applications/:id/status` | recruiter |

> **Atenção:** o driver `pg` devolve `BIGINT` e `NUMERIC` como **string**. Por isso `id`, `user_id`, `job_id`, `salary_min` e `salary_max` aparecem entre aspas nas respostas abaixo.

---

## Auth

### POST `/api/auth/register`

Cria um usuário.

Body:
```json
{
  "name": "Ana Souza",
  "email": "ana@mail.com",
  "password": "123456",
  "phone": "47999990000",
  "role": "dev",
  "preferred_role": "Backend Jr"
}
```
`phone` e `preferred_role` são opcionais. `role`: `dev` ou `recruiter`. Senha: 6 a 72 caracteres.

**201 Created**
```json
{
  "id": "1",
  "name": "Ana Souza",
  "email": "ana@mail.com",
  "phone": "47999990000",
  "role": "dev",
  "preferred_role": "Backend Jr",
  "created_at": "2026-10-15T22:48:00.000Z"
}
```
Erros: **400** (dados inválidos), **409** (e-mail já cadastrado).

### POST `/api/auth/login`

Body:
```json
{ "email": "ana@mail.com", "password": "123456" }
```

**200 OK**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "Ana Souza",
    "email": "ana@mail.com",
    "phone": "47999990000",
    "role": "dev",
    "preferred_role": "Backend Jr",
    "created_at": "2026-10-15T22:48:00.000Z"
  }
}
```
Erros: **400** (dados inválidos), **401** `{ "error": "E-mail ou senha inválidos" }`.

### GET `/api/auth/me`

Retorna o usuário dono do token.

**200 OK**
```json
{
  "id": "1",
  "name": "Ana Souza",
  "email": "ana@mail.com",
  "phone": "47999990000",
  "role": "dev",
  "preferred_role": "Backend Jr",
  "created_at": "2026-10-15T22:48:00.000Z"
}
```

---

## Vagas

### GET `/api/jobs`

Lista vagas. Por padrão retorna só as abertas, da mais recente para a mais antiga.

Query params (todos opcionais):

| Param | Descrição |
|---|---|
| `search` | Busca no título, empresa e descrição |
| `location` | Filtra por local |
| `work_model` | `remote`, `hybrid` ou `onsite` |
| `status` | `open` (padrão) ou `closed` |

Exemplo: `GET /api/jobs?search=node&work_model=remote`

**200 OK**
```json
[
  {
    "id": "1",
    "company": "Acme",
    "title": "Dev Júnior Node",
    "description": "Vaga para dev júnior com Node.js",
    "requirements": "Node, SQL, Git",
    "location": "São Paulo",
    "work_model": "remote",
    "salary_min": "3000.00",
    "salary_max": "4500.00",
    "status": "open",
    "created_at": "2026-10-15T22:48:00.000Z"
  }
]
```
Sem resultados: `[]`.

### GET `/api/jobs/:id`

**200 OK**: mesmo objeto de vaga acima (sem o array).

Erros: **400** (id inválido), **404** `{ "error": "Vaga não encontrada" }`.

### POST `/api/jobs` (recruiter)

Body:
```json
{
  "company": "Acme",
  "title": "Dev Júnior Node",
  "description": "Vaga para dev júnior com Node.js",
  "requirements": "Node, SQL, Git",
  "location": "São Paulo",
  "work_model": "remote",
  "salary_min": 3000,
  "salary_max": 4500
}
```
Obrigatórios: `company`, `title`, `description` (mín. 10 caracteres) e `work_model`. `salary_max` deve ser maior ou igual a `salary_min`.

**201 Created**: retorna a vaga criada (`status: "open"`).

Erros: **400**, **401**, **403**.

### PATCH `/api/jobs/:id` (recruiter)

Atualização parcial: envie só os campos que quer mudar. Também aceita `status` (`open` ou `closed`).

Body (exemplo: fechar a vaga):
```json
{ "status": "closed" }
```

**200 OK**: retorna a vaga atualizada.

Erros: **400**, **401**, **403**, **404**.

### DELETE `/api/jobs/:id` (recruiter)

**204 No Content** (sem corpo). As candidaturas da vaga também são removidas.

Erros: **401**, **403**, **404**.

### GET `/api/jobs/:id/applications` (recruiter)

Lista os candidatos de uma vaga.

**200 OK**
```json
[
  {
    "id": "1",
    "status": "submitted",
    "applied_at": "2026-10-15T23:10:00.000Z",
    "user_id": "1",
    "name": "Ana Souza",
    "email": "ana@mail.com",
    "phone": "47999990000",
    "preferred_role": "Backend Jr"
  }
]
```
Erros: **401**, **403**, **404** (vaga não encontrada).

---

## Candidaturas

### POST `/api/applications` (dev)

Body:
```json
{ "job_id": 1 }
```

**201 Created**
```json
{
  "id": "1",
  "user_id": "1",
  "job_id": "1",
  "status": "submitted",
  "applied_at": "2026-10-15T23:10:00.000Z"
}
```
Erros:
- **404** `{ "error": "Vaga não encontrada" }`
- **400** `{ "error": "Esta vaga está fechada" }`
- **409** `{ "error": "Já existe um registro com esses dados" }` (já se candidatou a essa vaga)

### GET `/api/applications/me` (dev)

Lista as candidaturas do usuário logado.

**200 OK**
```json
[
  {
    "id": "1",
    "status": "submitted",
    "applied_at": "2026-10-15T23:10:00.000Z",
    "job_id": "1",
    "title": "Dev Júnior Node",
    "company": "Acme"
  }
]
```

### PATCH `/api/applications/:id/status` (recruiter)

Body:
```json
{ "status": "approved" }
```
Valores: `submitted`, `reviewing`, `approved`, `rejected`.

**200 OK**
```json
{
  "id": "1",
  "user_id": "1",
  "job_id": "1",
  "status": "approved",
  "applied_at": "2026-10-15T23:10:00.000Z"
}
```
Erros: **400**, **401**, **403**, **404** `{ "error": "Candidatura não encontrada" }`.

---

## Formato dos erros

Todos os erros retornam JSON com a chave `error`.

**400** (validação), com a lista dos campos errados:
```json
{
  "error": "Dados inválidos",
  "details": [
    { "field": "company", "message": "Too small: expected string to have >=2 characters" },
    { "field": "work_model", "message": "Invalid option: expected one of \"remote\"|\"hybrid\"|\"onsite\"" }
  ]
}
```

Outros:

| Status | Quando | Exemplo |
|---|---|---|
| 400 | JSON quebrado | `{ "error": "JSON inválido" }` |
| 401 | Sem token | `{ "error": "Token não informado" }` |
| 401 | Token inválido ou expirado | `{ "error": "Token inválido ou expirado" }` |
| 403 | Papel sem permissão | `{ "error": "Acesso negado" }` |
| 404 | Rota inexistente | `{ "error": "Rota não encontrada" }` |
| 429 | Mais de 100 requisições em 15 min por IP | `{ "error": "Muitas requisições, tente novamente mais tarde" }` |
| 500 | Erro inesperado | `{ "error": "Erro interno do servidor" }` |

## Exemplo de fluxo completo

```bash
# 1. Recruiter se cadastra e faz login
curl -X POST localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Rita","email":"rita@acme.com","password":"123456","role":"recruiter"}'

curl -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"rita@acme.com","password":"123456"}'
# guarde o "token" retornado em $TOKEN_REC

# 2. Recruiter cria uma vaga
curl -X POST localhost:3000/api/jobs -H "Authorization: Bearer $TOKEN_REC" -H "Content-Type: application/json" \
  -d '{"company":"Acme","title":"Dev Júnior Node","description":"Vaga para dev júnior com Node.js","work_model":"remote"}'

# 3. Dev (já cadastrado, token em $TOKEN_DEV) busca e se candidata
curl "localhost:3000/api/jobs?search=node&work_model=remote"
curl -X POST localhost:3000/api/applications -H "Authorization: Bearer $TOKEN_DEV" -H "Content-Type: application/json" \
  -d '{"job_id":1}'

# 4. Recruiter vê os candidatos e aprova
curl localhost:3000/api/jobs/1/applications -H "Authorization: Bearer $TOKEN_REC"
curl -X PATCH localhost:3000/api/applications/1/status -H "Authorization: Bearer $TOKEN_REC" \
  -H "Content-Type: application/json" -d '{"status":"approved"}'
```
