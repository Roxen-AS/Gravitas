# Gravitas — Decision Accountability for Software Architecture

> Every engineering decision has a cost. Gravitas shows the receipt.

---

## What it is

Gravitas is a decision accountability engine for software systems.

Most tools answer: *What did we build? How is it performing?*

Gravitas answers the harder questions:
- **Why was this choice made?**
- **What did it cost — cognitively, operationally, financially?**
- **What would have happened if we had chosen differently?**

This is not an analytics platform. It is not documentation software. Gravitas makes architectural decisions **first-class citizens** and tracks their consequences over time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + React Flow |
| API | Vercel Serverless Functions (TypeScript) |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| LLM | OpenAI GPT-4o (narrative refinement only) |
| Deploy | Vercel (single project) |

---

## Project Structure

```
gravitas/
├── api/                        # Vercel serverless API routes
│   ├── events/index.ts         # POST /api/events
│   ├── history/index.ts        # GET  /api/history
│   ├── governance/
│   │   ├── [decisionId].ts     # GET  /api/governance/:id
│   │   └── update.ts           # POST /api/governance/update
│   ├── narrative/refine.ts     # POST /api/narrative/refine
│   ├── components/index.ts     # GET/POST /api/components
│   └── health/index.ts         # GET  /api/health
├── lib/
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── schema.ts               # Drizzle ORM schema
│   ├── db.ts                   # Neon DB connection
│   ├── narrative.ts            # Deterministic narrative engine
│   └── seed.ts                 # DB seed script
├── src/
│   ├── components/
│   │   ├── ArchNode.tsx        # Custom React Flow node
│   │   ├── Graph.tsx           # React Flow canvas
│   │   ├── RightPanel.tsx      # Sidebar inspector
│   │   ├── DecisionTab.tsx     # Decision + cost bars
│   │   ├── WhyTab.tsx          # Rationale + narrative
│   │   ├── ForkTab.tsx         # Fork reality simulator
│   │   ├── GovernanceTab.tsx   # Governance record
│   │   ├── CostBars.tsx        # Animated cost dimension bars
│   │   └── AddDecisionModal.tsx # Two-step decision form
│   ├── hooks/useGravitas.ts    # Data fetching hooks
│   ├── styles/globals.css      # Dark theme design tokens
│   ├── App.tsx                 # Root layout
│   └── main.tsx                # Entry point
├── index.html
├── vercel.json
├── drizzle.config.ts
└── .env.example
```

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd gravitas
npm install
```

### 2. Set up Neon database

1. Go to [console.neon.tech](https://console.neon.tech) → create a free project called `gravitas`
2. Copy the **Connection string** (postgresql://...)
3. Create `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local and paste your values:
DATABASE_URL=postgresql://user:pass@host.neon.tech/gravitas?sslmode=require
OPENAI_API_KEY=sk-...
```

### 3. Initialize the database

```bash
npm run db:push      # creates all tables
npx tsx lib/seed.ts  # loads demo data (optional but recommended)
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> The dev server proxies `/api/*` to Vite's local handler. For full serverless API locally, use `vercel dev` instead.

---

## Deploy to Vercel

### One-time setup

```bash
npm install -g vercel
vercel login
vercel link       # or: vercel --yes
```

### Add environment variables

In [vercel.com](https://vercel.com) → your project → **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `OPENAI_API_KEY` | Your OpenAI API key |

### Deploy

```bash
vercel deploy --prod
```

That's it. One command, one project, zero separate backend.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/events` | Record a new decision event |
| `GET`  | `/api/history?component=X` | Get all decisions for a component |
| `GET`  | `/api/governance/:decisionId` | Get governance record |
| `POST` | `/api/governance/update` | Update governance status/owner |
| `POST` | `/api/narrative/refine` | AI-refine a decision narrative |
| `GET`  | `/api/components` | Get all graph nodes + edges |
| `POST` | `/api/components` | Upsert a graph node |
| `GET`  | `/api/health` | Health check |

### POST /api/events — payload

```json
{
  "component": "api-gateway",
  "choice": "REST over GraphQL",
  "description": "API protocol decision",
  "rationale": "Team familiarity; no complex client queries in v1",
  "assumptions": ["Traffic < 50K req/day", "Team has REST expertise"],
  "costs": {
    "cognitive": 30,
    "operational": 25,
    "performance": 40,
    "financial": 35,
    "change": 55
  },
  "alternatives": [
    { "name": "GraphQL", "reason": "Added schema overhead with no benefit" }
  ],
  "owner": "Sarah K.",
  "reviewers": ["Daniel O."]
}
```

---

## Core Concepts

### Decision Nodes
Every architectural choice is modeled as an immutable event. History is never mutated — only appended to.

### Cost Dimensions
Each decision is evaluated across five planes:
- **Cognitive** — mental overhead, onboarding difficulty
- **Operational** — deployment, observability, incident burden
- **Performance** — latency, throughput, cold starts
- **Financial** — infra spend, scaling costs, licensing
- **Change** — refactor difficulty, lock-in, blast radius

### Rationale Engine
The system generates deterministic, sentence-level narratives from structured data. Each sentence cites its sources. LLM refinement improves wording only — it cannot introduce new facts.

### Fork Reality
Branch from any decision point, simulate an alternative path, and compare how costs diverge. Forks are counterfactual — they do not affect the production decision record.

### Governance
Every decision automatically creates a governance record with owner, status (`proposed` / `approved` / `rejected` / `superseded`), reviewers, and notes.

---

## Philosophy

Good engineering is not about avoiding trade-offs.  
It is about **understanding and owning them**.

Gravitas exists to make that ownership visible.

---

## License

MIT
