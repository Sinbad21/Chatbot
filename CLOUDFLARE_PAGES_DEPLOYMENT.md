# Cloudflare Pages Deployment with @cloudflare/next-on-pages

This project uses the official **@cloudflare/next-on-pages** adapter to deploy Next.js with full support for:
- Dynamic routes (`[id]`)
- Server-side rendering (SSR)
- API routes
- All Next.js features

## Prerequisites

1. **Cloudflare account** with Pages enabled
2. **GitHub repository** connected to Cloudflare Pages
3. **Environment variables** configured in Cloudflare Pages dashboard

## Environment Variables

### Cloudflare Pages (Frontend)
Navigate to: **Pages → Your Project → Settings → Environment Variables**

Add the following variable:
```
NEXT_PUBLIC_API_URL=https://chatbotstudio.sinbad21.workers.dev
```

### Cloudflare Workers (Backend API)
Navigate to: **Workers & Pages → chatbotstudio → Settings → Variables and Secrets**

Add the following secrets:
```
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-long-random-secret-string-here
JWT_REFRESH_SECRET=your-long-random-refresh-secret-string-here
```

**Important:** For `DATABASE_URL`, use ONLY the connection string. Do NOT include `psql '` at the beginning or `'` at the end.

## Build Configuration

### Cloudflare Pages Build Settings

In your Cloudflare Pages project settings:

**Build command:**
```bash
npm run pages:build
```

**Build output directory:**
```
.vercel/output/static
```

**Root directory:**
```
apps/web
```

**Node version:**
```
18
```

**Environment variables:**
- Framework preset: `Next.js`
- Build command: `npm run pages:build`

## Build Process

The `pages:build` script does the following:

1. Runs Next.js build: `next build`
2. Runs `@cloudflare/next-on-pages` adapter to convert the Next.js build to Cloudflare Pages format
3. Outputs to `.vercel/output/static` (Cloudflare Pages compatible format)

## Project Structure

```
/Chatbot
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   └── app/
│   │   │       └── dashboard/
│   │   │           └── bots/
│   │   │               ├── page.tsx         # Bots list
│   │   │               └── [id]/
│   │   │                   └── page.tsx     # Bot detail (dynamic route)
│   │   ├── package.json
│   │   └── next.config.js
│   └── api-worker/             # Cloudflare Workers API
│       ├── src/
│       │   └── index.ts
│       ├── wrangler.toml
│       └── package.json
└── packages/
    └── database/               # Prisma schema
        └── prisma/
            └── schema.prisma
```

## Deployment Steps

### 1. Deploy Backend API (Cloudflare Workers)

```bash
cd apps/api-worker
npm run build  # This runs: prisma generate && wrangler deploy
```

### 2. Deploy Frontend (Cloudflare Pages)

**Option A: Automatic deployment (via GitHub)**
- Push your changes to the `main` branch
- Cloudflare Pages will automatically build and deploy

**Option B: Manual deployment**
```bash
cd apps/web
npm run pages:build
npx wrangler pages deploy .vercel/output/static
```

## Troubleshooting

### Build fails with "generateStaticParams" error
- **Cause:** You may have removed `output: 'export'` but not installed the adapter
- **Fix:** Make sure `@cloudflare/next-on-pages` is installed:
  ```bash
  cd apps/web
  npm install --save-dev @cloudflare/next-on-pages vercel
  ```

### Dynamic routes return 404
- **Cause:** Build command is using `next build` instead of `pages:build`
- **Fix:** Update Cloudflare Pages build settings to use `npm run pages:build`

### API requests fail with CORS errors
- **Cause:** Frontend URL not whitelisted in API CORS configuration
- **Fix:** Add your Cloudflare Pages URL to the CORS origins array in `apps/api-worker/src/index.ts`:
  ```typescript
  app.use('/*', cors({
    origin: ['https://your-project.pages.dev', 'http://localhost:3000'],
    credentials: true,
  }));
  ```

### Database connection errors
- **Cause:** Invalid DATABASE_URL format
- **Fix:** Ensure you're using ONLY the connection string (no `psql '` wrapper):
  ```
  ✅ CORRECT: postgresql://user:pass@host/db?sslmode=require
  ❌ WRONG: psql 'postgresql://user:pass@host/db?sslmode=require'
  ```

## Local Development

### Frontend
```bash
cd apps/web
npm run dev
```

The app will run on `http://localhost:3000`

### Backend API
```bash
cd apps/api-worker
npm run dev
```

The API will run on `http://localhost:8787`

**Important:** Update your local `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8787
```

## Features Enabled by @cloudflare/next-on-pages

✅ **Dynamic routes** - Clean URLs like `/bots/[id]`
✅ **Server-side rendering** - React Server Components
✅ **API routes** - `/app/api/*` routes work
✅ **Middleware** - Authentication and redirects
✅ **Image optimization** - With `unoptimized: true`
✅ **Environment variables** - `process.env.NEXT_PUBLIC_*`
✅ **Client-side navigation** - `next/link` and `next/navigation`

## Migration from Static Export

Previously, this project used `output: 'export'` which generated only static HTML files. This had limitations:
- ❌ No dynamic routes without query parameters
- ❌ No server-side rendering
- ❌ No API routes in Next.js app

With `@cloudflare/next-on-pages`:
- ✅ All Next.js features work
- ✅ Cloudflare Pages Functions for dynamic content
- ✅ Edge runtime for fast global performance
- ✅ No code changes needed (just build process)

## Resources

- [Cloudflare Next.js Guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [@cloudflare/next-on-pages Documentation](https://github.com/cloudflare/next-on-pages)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Documentation](https://nextjs.org/docs)
