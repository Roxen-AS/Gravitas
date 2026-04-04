/**
 * Local development API server.
 * Mirrors all Vercel serverless routes so `npm run dev` works end-to-end.
 * NOT used in production — Vercel handles routing there.
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import express from 'express'
import type { Request, Response } from 'express'

// Import all handlers
import eventsHandler      from './api/events/index'
import historyHandler     from './api/history/index'
import govGetHandler      from './api/governance/[decisionId]'
import govUpdateHandler   from './api/governance/update'
import narrativeHandler   from './api/narrative/refine'
import componentsHandler  from './api/components/index'
import healthHandler      from './api/health/index'

const app = express()
app.use(express.json())

// Adapt Vercel's req/res shape to Express (they're compatible enough)
const wrap = (handler: Function) => (req: Request, res: Response) => handler(req, res)

app.all('/api/events',               wrap(eventsHandler))
app.all('/api/history',              wrap(historyHandler))
app.all('/api/governance/update',    wrap(govUpdateHandler))
app.all('/api/governance/:decisionId', (req: Request, res: Response) => {
  // inject param into query so handler can read req.query.decisionId
  req.query.decisionId = req.params.decisionId
  govGetHandler(req as any, res as any)
})
app.all('/api/narrative/refine',     wrap(narrativeHandler))
app.all('/api/components',           wrap(componentsHandler))
app.all('/api/health',               wrap(healthHandler))

const PORT = 3001
app.listen(PORT, () => {
  console.log(`✅ Gravitas API running at http://localhost:${PORT}`)
})
