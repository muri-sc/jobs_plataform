# DevStart Jobs (frontend)

SPA em Vite + React (JS) consumindo a Jobs API local.

## Como rodar

```bash
# na raiz do monorepo, suba a API
npm install
cp .env.example .env   # se ainda não tiver
npm run dev            # API em http://localhost:3000

# em outro terminal
cd frontend
cp .env.example .env   # se necessário
npm install
npm run dev            # http://localhost:5173
```

## Variáveis

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | Base da API (com `/api`) | `http://localhost:3000/api` |

## Papéis

- **dev** — preferências, buscar vagas, candidatar, ver candidaturas
- **recruiter** — CRUD de vagas e gestão de status dos candidatos
