import { pgTable, text, jsonb, timestamp, uuid, integer } from 'drizzle-orm/pg-core'

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  component: text('component').notNull(),
  choice: text('choice').notNull(),
  description: text('description').notNull(),
  rationale: text('rationale').notNull(),
  assumptions: jsonb('assumptions').notNull().$type<string[]>(),
  costs: jsonb('costs').notNull().$type<{
    cognitive: number
    operational: number
    performance: number
    financial: number
    change: number
  }>(),
  alternatives: jsonb('alternatives').notNull().$type<{ name: string; reason: string }[]>(),
  forkId: text('fork_id'),
  forkParentId: text('fork_parent_id'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

export const governance = pgTable('governance', {
  id: uuid('id').primaryKey().defaultRandom(),
  decisionId: text('decision_id').notNull(),
  owner: text('owner').notNull(),
  status: text('status').notNull().$type<'proposed' | 'approved' | 'rejected' | 'superseded'>(),
  reviewers: jsonb('reviewers').notNull().$type<string[]>(),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const components = pgTable('components', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  description: text('description').notNull().default(''),
  posX: integer('pos_x').notNull().default(0),
  posY: integer('pos_y').notNull().default(0),
})

export const edges = pgTable('edges', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(),
  target: text('target').notNull(),
  label: text('label'),
})
