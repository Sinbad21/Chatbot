import { PrismaClient } from '@prisma/client/edge';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  OPENAI_API_KEY?: string;
};

const PRISMA_KEY = Symbol.for('__PRISMA_WORKER_INSTANCE__');

function makePrisma(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

/**
 * Get or create Prisma client instance for Cloudflare Workers
 * Uses singleton pattern to avoid creating multiple connections
 */
export function getPrisma(env: Bindings): PrismaClient {
  // Validate DATABASE_URL
  if (!env?.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from environment variables');
  }

  // Use global singleton to avoid recreating instances
  const g = globalThis as any;

  if (!g[PRISMA_KEY]) {
    console.log('[Prisma] Creating new Prisma client instance');
    g[PRISMA_KEY] = makePrisma(env.DATABASE_URL);
  }

  return g[PRISMA_KEY] as PrismaClient;
}
