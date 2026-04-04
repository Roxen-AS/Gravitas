import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('🌱 Seeding Gravitas...')

  await db.execute(`
    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      pos_x INTEGER NOT NULL DEFAULT 0,
      pos_y INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS edges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      label TEXT
    );
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      component TEXT NOT NULL,
      choice TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      rationale TEXT NOT NULL,
      assumptions JSONB NOT NULL,
      costs JSONB NOT NULL,
      alternatives JSONB NOT NULL,
      fork_id TEXT,
      fork_parent_id TEXT,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS governance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      decision_id TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL,
      reviewers JSONB NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  ` as any)

  await db.insert(schema.components).values([
    { id: 'api-gateway',  label: 'API Gateway',  description: 'REST entry point',   posX: 300, posY: 80  },
    { id: 'auth-service', label: 'Auth Service', description: 'JWT auth layer',     posX: 80,  posY: 240 },
    { id: 'database',     label: 'Database',     description: 'Primary data store', posX: 300, posY: 380 },
    { id: 'job-queue',    label: 'Job Queue',    description: 'Async processing',   posX: 520, posY: 240 },
    { id: 'cache',        label: 'Cache Layer',  description: 'Redis cache',        posX: 520, posY: 400 },
  ]).onConflictDoNothing()

  await db.insert(schema.edges).values([
    { source: 'api-gateway',  target: 'auth-service' },
    { source: 'api-gateway',  target: 'database'     },
    { source: 'api-gateway',  target: 'job-queue'    },
    { source: 'database',     target: 'cache'        },
    { source: 'job-queue',    target: 'cache'        },
  ]).onConflictDoNothing()

  const decisions = [
    {
      component: 'api-gateway',
      choice: 'REST over GraphQL',
      description: 'API protocol choice',
      rationale: 'Optimized for team familiarity and reduced initial complexity, accepting flexibility cost later',
      assumptions: ['Traffic < 50K req/day for 12 months', 'Team has deeper REST expertise', 'No complex client-driven queries in v1'],
      costs: { cognitive: 30, operational: 25, performance: 40, financial: 35, change: 55 },
      alternatives: [{ name: 'GraphQL', reason: 'Added schema overhead with no client benefit at launch scale' }],
    },
    {
      component: 'auth-service',
      choice: 'Stateless JWT tokens',
      description: 'Authentication mechanism',
      rationale: 'Eliminated session infrastructure at the cost of a harder token revocation story',
      assumptions: ['< 1K users at launch', 'Revocation complexity acceptable', 'No compliance session requirements'],
      costs: { cognitive: 45, operational: 35, performance: 20, financial: 20, change: 65 },
      alternatives: [{ name: 'Server-side sessions', reason: 'Required Redis session store — added operational complexity' }],
    },
    {
      component: 'database',
      choice: 'PostgreSQL (relational)',
      description: 'Primary data store selection',
      rationale: 'Strong relational guarantees and team expertise chosen over NoSQL flexibility',
      assumptions: ['< 10K writes/hr for 18 months', 'ACID guarantees required for financial data', 'No unstructured storage needed'],
      costs: { cognitive: 25, operational: 40, performance: 50, financial: 45, change: 50 },
      alternatives: [
        { name: 'MongoDB',   reason: 'Flexible schema not needed; consistency preferred for financial records' },
        { name: 'DynamoDB',  reason: 'Operational complexity and vendor lock-in concerns' },
      ],
    },
    {
      component: 'job-queue',
      choice: 'Redis-backed queue (BullMQ)',
      description: 'Async job processing',
      rationale: 'Reused existing Redis infra to avoid additional managed service cost, accepting reduced durability vs SQS',
      assumptions: ['Job loss on Redis failure < 0.1%', 'Existing Redis handles queue load', 'No multi-region jobs needed'],
      costs: { cognitive: 40, operational: 55, performance: 30, financial: 35, change: 45 },
      alternatives: [{ name: 'AWS SQS', reason: 'Avoided AWS lock-in; no multi-region need at this stage' }],
    },
    {
      component: 'cache',
      choice: 'Redis in-memory cache',
      description: 'Caching strategy',
      rationale: 'Consolidated cache onto existing Redis instance to reduce infra surface area',
      assumptions: ['Single Redis instance sufficient at current scale', 'TTLs manageable without stale-data risk'],
      costs: { cognitive: 20, operational: 30, performance: 15, financial: 25, change: 30 },
      alternatives: [{ name: 'Memcached', reason: 'Less feature-rich; no persistence option if needed later' }],
    },
  ]

  for (const d of decisions) {
    const [event] = await db.insert(schema.events).values({
      ...d,
      forkId: null,
      forkParentId: null,
    }).returning()

    await db.insert(schema.governance).values({
      decisionId: event.id,
      owner: 'Team Lead',
      status: 'approved',
      reviewers: ['Architect', 'Senior Engineer'],
      notes: 'Reviewed and approved in architecture session.',
    })
  }

  console.log('✅ Seed complete — 5 components, 5 edges, 5 decisions seeded.')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
