# Jobs API (MVP)

API de vagas para devs iniciantes. Stack: Node (ES Modules), Express 5, pg, Zod, bcryptjs, JWT, express-rate-limit, dotenv.

## Como rodar

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
psql $DATABASE_URL -f database/schema.sql
npm run dev                 # desenvolvimento (reinicia ao salvar)
npm start                   # produção
```

## Estrutura (MVC)

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

## Papéis

- `dev`: se candidata e vê suas candidaturas.
- `recruiter`: cria/edita/exclui vagas e gerencia candidaturas.

## Rotas

Rotas autenticadas usam o header `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /api/auth/register | público | Cadastro |
| POST | /api/auth/login | público | Login (retorna token) |
| GET | /api/auth/me | logado | Dados do usuário |
| GET | /api/jobs | público | Lista vagas (`?search=&location=&work_model=&status=`) |
| GET | /api/jobs/:id | público | Detalhe da vaga |
| POST | /api/jobs | recruiter | Cria vaga |
| PATCH | /api/jobs/:id | recruiter | Edita vaga (parcial, inclusive `status`) |
| DELETE | /api/jobs/:id | recruiter | Remove vaga |
| GET | /api/jobs/:id/applications | recruiter | Candidatos da vaga |
| POST | /api/applications | dev | Candidatar-se `{ "job_id": 1 }` |
| GET | /api/applications/me | dev | Minhas candidaturas |
| PATCH | /api/applications/:id/status | recruiter | `submitted`, `reviewing`, `approved`, `rejected` |

## Exemplos

```bash
# Cadastro
curl -X POST localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@mail.com","password":"123456","role":"dev","preferred_role":"Backend Jr"}'

# Login
curl -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com","password":"123456"}'

# Criar vaga (token de recruiter)
curl -X POST localhost:3000/api/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"company":"Acme","title":"Dev Júnior","description":"Vaga para dev júnior Node","work_model":"remote","salary_min":3000,"salary_max":4500}'

# Buscar vagas remotas com "node"
curl "localhost:3000/api/jobs?search=node&work_model=remote"

# Candidatar-se (token de dev)
curl -X POST localhost:3000/api/applications -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"job_id":1}'
```

## Erros

Formato padrão: `{ "error": "mensagem", "details": [{ "field": "...", "message": "..." }] }`

Status usados: 400 (validação), 401 (sem token/token inválido), 403 (sem permissão), 404, 409 (duplicado), 429 (rate limit), 500.
