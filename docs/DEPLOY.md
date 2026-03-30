# Deploy — MITRA

## Variaveis de Ambiente

### Backend

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta do servidor | `3000` |
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:5432/mitra_db` |
| `JWT_SECRET` | Secret do access token | (gerar com `openssl rand -hex 32`) |
| `JWT_EXPIRATION` | Duracao access token | `15m` |
| `JWT_REFRESH_SECRET` | Secret do refresh token | (gerar com `openssl rand -hex 32`) |
| `JWT_REFRESH_EXPIRATION` | Duracao refresh token | `7d` |
| `CORS_ORIGINS` | Origins permitidos | `https://mitra.pet` |
| `RESEND_API_KEY` | API key do Resend (emails) | `re_...` |
| `FRONTEND_URL` | URL do frontend (para links em emails) | `https://mitra.pet` |

### Frontend

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL da API | `https://api.mitra.pet/api/v1` |

---

## Deploy com Docker Compose

### Producao

```bash
# Copiar e editar variaveis
cp .env.example .env
# Editar .env com valores de producao

# Build e start
docker-compose -f docker-compose.yml up -d --build

# Rodar migrations
docker-compose exec backend npx prisma migrate deploy
```

### docker-compose.yml

Veja o arquivo `docker-compose.yml` na raiz do projeto.

---

## Deploy do Backend (VPS / Railway / Render)

### Build

```bash
cd backend
npm ci
npx prisma generate
npm run build
```

### Start

```bash
node dist/main.js
```

### Migrations

```bash
npx prisma migrate deploy
```

### Health Check

```
GET /api/v1/health → 200 OK
```

---

## Deploy do Frontend (Vercel)

### Configuracao Vercel

1. Importe o repositorio no Vercel
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Adicione variavel de ambiente:
   - `NEXT_PUBLIC_API_URL` = `https://api.seudominio.com/api/v1`

### Build local

```bash
cd frontend
npm ci
npm run build
```

---

## PostgreSQL

### Setup

```bash
# Criar banco
createdb mitra_db

# Ou via psql
psql -c "CREATE DATABASE mitra_db;"

# Aplicar schema
cd backend
npx prisma migrate deploy
```

### Backup

```bash
pg_dump mitra_db > backup_$(date +%Y%m%d).sql
```

### Restaurar

```bash
psql mitra_db < backup_20250101.sql
```

---

## Checklist de Deploy

- [ ] Variaveis de ambiente configuradas (JWT secrets unicos!)
- [ ] PostgreSQL rodando e acessivel
- [ ] Migrations aplicadas (`prisma migrate deploy`)
- [ ] CORS configurado para o dominio do frontend
- [ ] HTTPS habilitado
- [ ] Backups do banco configurados
- [ ] Monitoramento de logs configurado
