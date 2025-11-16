# Debug 404 su Cloudflare Workers

## Problema
Homepage (/) restituisce 404 dopo deploy su Cloudflare Workers.

## Diagnostica

### 1. Verifica Logs Cloudflare

```bash
cd apps/web
npx wrangler tail chatbot-studio-web
```

Poi apri il browser e accedi alla homepage. Guarda i log per vedere cosa succede.

### 2. Test Locale con Wrangler Dev

```bash
cd apps/web
npm run pages:dev
```

Apri http://localhost:8787 e verifica se funziona localmente.

### 3. Verifica Deployment

```bash
cd apps/web
npx wrangler deployments list chatbot-studio-web
```

### 4. Controlla Worker su Dashboard

1. Vai su https://dash.cloudflare.com
2. Workers & Pages
3. chatbot-studio-web
4. Settings → Variables
   - Verifica che ASSETS binding sia configurato

## Possibili Cause

### A) Assets Binding Non Configurato

**Sintomo:** 404 su tutte le route

**Fix:**
Il binding ASSETS potrebbe non essere stato creato correttamente.

```bash
# Redeploy forzando la configurazione
cd apps/web
npx wrangler deploy --compatibility-date=2025-05-05
```

### B) Base Path Mancante

**Sintomo:** Homepage 404 ma altre route potrebbero funzionare

**Fix:** Verifica che `globalThis.__NEXT_BASE_PATH__` sia "" (stringa vuota).

### C) Middleware Blocca la Request

**Sintomo:** Redirect o 404 inaspettati

**Fix:** Controlla il middleware in `src/middleware.ts`

## Soluzione Rapida

Prova questo deploy completo:

```bash
cd apps/web

# 1. Clean
npm run clean

# 2. Build fresh
npm run build
npm run pages:build

# 3. Deploy con log verbose
npx wrangler deploy --log-level debug
```

## Riporta

Esegui questi comandi e riporta l'output:

```bash
# 1. Tail logs (tieni aperto e accedi al sito)
npx wrangler tail chatbot-studio-web

# 2. Check deployment
npx wrangler deployments list chatbot-studio-web

# 3. Test locale
npm run pages:dev
# Apri http://localhost:8787 e verifica
```
