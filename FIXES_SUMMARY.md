# 🔧 Correzioni Implementate - Documents API

## 📅 Data: 3 Novembre 2025

---

## ❌ Problemi Identificati

### 1. GET `/api/bots/:botId/documents` → 500 "Failed to fetch documents"
- **Causa**: Nessun try/catch → errori Prisma non gestiti
- **Mancava**: Logging e mapping codici errore P20xx

### 2. POST `/api/bots/:botId/documents` → 500 "Database error"  
- **Causa**: Errori FK/NOT NULL non mappati
- **Mancava**: Error handling per P2003 (FK constraint)

---

## ✅ Soluzioni Implementate

### 1. **File Modificato**: `apps/api-worker/src/routes/knowledge.ts`

#### GET `/api/bots/:botId/documents`
```typescript
✅ Aggiunto try/catch completo
✅ Logging con prefix [GET /documents]
✅ Mapping errori Prisma:
   - P2025 → 404 (Record not found)
   - P2003 → 400 (Invalid FK)
   - Fallback → 500 (Database error con code + message)
✅ Response formato: { documents: [...] }
✅ Tenant-safe check: user → org → bot
```

#### POST `/api/bots/:botId/documents`
```typescript
✅ Aggiunto try/catch completo
✅ Logging dettagliato: error.code, error.meta
✅ Mapping errori Prisma:
   - P2003 → 409 (FK constraint: bot non esiste)
   - P2025 → 404 (Record not found)
   - P2002 → 409 (Unique constraint)
   - P20xx generico → 400 (Constraint error)
   - Fallback → 500 (Database error)
✅ Validazione input (title, content required)
✅ Tenant-safe check: user → org → bot
```

### 2. **File Modificato**: `apps/api-worker/src/index.ts`

#### Nuovo endpoint: GET `/api/v1/debug/db`
```typescript
✅ Test connessione: SELECT 1
✅ Count tabelle: users, organizations, bots, documents
✅ Response:
   - ok: true/false
   - database: 'connected' | error details
   - counts: { users, organizations, bots, documents }
   - timestamp
✅ Error logging con console.error
```

### 3. **File Creato**: `DOCUMENTS_API_TROUBLESHOOTING.md`
```markdown
✅ Guida completa troubleshooting
✅ Schema Document attuale + proposta estensione
✅ Istruzioni deploy Cloudflare Workers
✅ Comandi Prisma migrate deploy
✅ Tabella errori comuni (P2003, P2025, P2002, 403, 404)
✅ Query SQL per diagnostica
✅ Checklist pre-deploy
✅ Test curl per validazione
✅ Setup Prisma Accelerate per Workers
```

---

## 🔍 Schema Document Verificato

**Attuale in `schema.prisma`**:
```prisma
model Document {
  id        String   @id @default(cuid())
  botId     String
  bot       Bot      @relation(fields: [botId], references: [id], onDelete: Cascade)
  title     String      // ← Non 'name'
  content   String   @db.Text
  createdAt DateTime @default(now())

  @@index([botId])
  @@map("documents")
}
```

**NON ha**:
- ❌ `organizationId`
- ❌ `createdByUserId`
- ❌ `name` (usa `title`)

**Se serve multi-tenant tracking esteso**: Vedi proposta nel troubleshooting guide

---

## 🚀 Prossimi Step per Deploy

### 1. Verifica Locale (Opzionale)
```bash
cd apps/api-worker
npm install
npm run dev
```

### 2. Applica Migrations in Produzione
```bash
cd packages/database

# Imposta DATABASE_URL del DB produzione
export DATABASE_URL="postgresql://..."

# Applica tutte le migrations
npx prisma migrate deploy

# Genera Prisma Client
npx prisma generate
```

### 3. Deploy Worker su Cloudflare
```bash
cd apps/api-worker

# Assicurati che wrangler.toml sia configurato
# e che env vars siano settate nel dashboard

# Deploy
npm run deploy
# oppure
wrangler publish
```

### 4. Test Health-Check
```bash
# Test connessione DB
curl https://your-worker.workers.dev/api/v1/debug/db

# Expected (se OK):
{
  "ok": true,
  "database": "connected",
  "counts": {
    "users": 5,
    "organizations": 3,
    "bots": 2,
    "documents": 10
  },
  "timestamp": "2025-11-03T..."
}
```

### 5. Test Endpoints Documents
```bash
# Login (ottieni token)
curl -X POST https://your-api/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# GET documents (con token)
curl https://your-api/api/bots/BOT_ID/documents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# POST document (con token)
curl -X POST https://your-api/api/bots/BOT_ID/documents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Content here"}'
```

---

## 📊 Diagnostica Errori Post-Deploy

### Se ancora 500 su GET/POST:

1. **Check `/debug/db` prima di tutto**
   ```bash
   curl https://your-api/api/v1/debug/db
   ```
   - Se `ok: false` → Problema connessione DB (URL, credentials, pooling)
   - Se `ok: true` → Problema tenant/FK

2. **Check Cloudflare Logs**
   - Dashboard → Workers → api-worker → Logs → Real-time Logs
   - Cerca prefix `[GET /documents]` o `[POST /documents]`
   - Verifica codice errore Prisma (P2003, P2025, ecc.)

3. **Verifica Tenant Consistency**
   ```sql
   -- User ha organization?
   SELECT u.email, om.organizationId 
   FROM users u 
   LEFT JOIN organization_members om ON u.id = om.userId
   WHERE u.email = 'tuo@email.com';
   
   -- Bot appartiene a org corretta?
   SELECT b.id, b.name, b.organizationId, o.name as org_name
   FROM bots b
   JOIN organizations o ON b.organizationId = o.id
   WHERE b.id = 'bot_id';
   ```

4. **Fix Common Issues**:
   - **P2003 (FK error)**: Bot non esiste o è stato cancellato
   - **403 no organization**: User non ha record in `organization_members`
   - **404 bot not found**: Bot non appartiene all'org dell'utente

---

## 🎯 Checklist Completamento

- [x] ✅ Try/catch su GET documents con error mapping
- [x] ✅ Try/catch su POST documents con error mapping
- [x] ✅ Logging dettagliato (`console.error` con prefix)
- [x] ✅ Endpoint `/debug/db` per health-check
- [x] ✅ CORS già configurato globalmente in `index.ts`
- [x] ✅ Tenant-safe checks (user → org → bot)
- [x] ✅ Guida troubleshooting completa
- [x] ✅ Schema Document verificato (title, non name)
- [x] ✅ Error codes mappati (P2003, P2025, P2002)
- [ ] 🔄 Deploy su Cloudflare (da eseguire)
- [ ] 🔄 Test `/debug/db` in produzione
- [ ] 🔄 Test GET/POST documents in produzione

---

## 📝 Note Importanti

1. **Schema Semplificato**: Document NON ha `organizationId`/`createdByUserId` attualmente. Funziona perché il tenant check è fatto su `bot.organizationId`.

2. **CORS Globale**: Già configurato in `apps/api-worker/src/index.ts` con:
   ```typescript
   app.use('/*', cors({
     origin: [...domains...],
     credentials: true,
   }));
   ```

3. **Prisma su Workers**: Se hai errori intermittenti, considera Prisma Accelerate (vedi troubleshooting guide).

4. **Logging Produzione**: Tutti i `console.error` saranno visibili in Cloudflare Workers Logs con prefix per filtro facile.

---

## 🆘 Se Ancora Problemi

1. Testa `/debug/db` → se fallisce, è problema connessione DB
2. Verifica env vars in Cloudflare: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
3. Controlla Cloudflare Logs per codici Prisma
4. Esegui query SQL per verificare tenant consistency (user → org → bot)
5. Prova con curl per isolare se è problema frontend o backend

---

**Status Finale**: ✅ **Codice pronto per deploy**  
**Prossimo Step**: Esegui `npx prisma migrate deploy` e deploy Worker
