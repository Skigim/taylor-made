# Audit Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Vercel serverless function at `api/audit.ts` that stores audit form submissions in Vercel Postgres (Neon) and sends two emails via Resend — one internal alert to TaylorMade and one acknowledgment to the submitter.

**Architecture:** A single `POST /api/audit` serverless function validates the incoming JSON body, inserts a row into the `leads` table, then dispatches both emails in parallel. Email failure is non-blocking; DB failure returns 500. A shared `api/_db.ts` re-exports the Vercel Postgres `sql` client so it can be mocked in unit tests.

**Tech Stack:** Vercel (hosting + serverless), `@vercel/postgres` (Neon), `resend`, Vitest (unit tests)

---

## File Map

| Action | Path | Purpose |
|---|---|---|
| Create | `api/_db.ts` | Re-exports `sql` from `@vercel/postgres`; mockable in tests |
| Create | `api/audit.ts` | Serverless handler — validates, inserts, emails |
| Create | `api/audit.test.ts` | Vitest unit tests for the handler |
| Create | `scripts/migrate.ts` | One-time script to create the `leads` table |
| Create | `vercel.json` | Declares Vite framework to Vercel |
| Modify | `tsconfig.json` | Add `api` and `scripts` to `include` |
| Modify | `vite.config.ts` | Add Vitest `test` config block |
| Modify | `package.json` | Add deps + `test:unit` script |

---

## Task 1: Install Dependencies and Update Project Config

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`
- Create: `vercel.json`

- [ ] **Step 1: Install npm packages**

```bash
npm install @vercel/postgres resend
npm install --save-dev tsx vitest @vercel/node @types/node
```

Expected: No errors. New packages appear in `package.json` under `dependencies` and `devDependencies`.

- [ ] **Step 2: Add `test:unit` script to `package.json`**

In the `"scripts"` section of `package.json`, add:

```json
"test:unit": "vitest run"
```

The full scripts section becomes:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test:e2e": "playwright test",
  "test:unit": "vitest run"
}
```

- [ ] **Step 3: Update `tsconfig.json` to include `api` and `scripts`**

Replace the `include` array so TypeScript type-checks the new directories:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "tests", "api", "scripts", "playwright.config.ts"]
}
```

- [ ] **Step 4: Add Vitest config to `vite.config.ts`**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';

const basePath = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base: basePath.endsWith('/') ? basePath : `${basePath}/`,
  test: {
    include: ['api/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 5: Create `vercel.json`**

```json
{
  "framework": "vite"
}
```

- [ ] **Step 6: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vercel.json
git commit -m "chore: add backend deps and update project config for Vercel + Vitest"
```

---

## Task 2: DB Helper and Migration Script

**Files:**
- Create: `api/_db.ts`
- Create: `scripts/migrate.ts`

- [ ] **Step 1: Create `api/_db.ts`**

This thin re-export is the only thing unit tests need to mock to isolate the handler from the real database.

```typescript
import { sql } from '@vercel/postgres';

export { sql };
```

- [ ] **Step 2: Create `scripts/migrate.ts`**

```typescript
import { sql } from '@vercel/postgres';

if (!process.env['POSTGRES_URL']) {
  console.error('POSTGRES_URL env var is required');
  process.exit(1);
}

async function migrate(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id              SERIAL PRIMARY KEY,
      full_name       TEXT NOT NULL,
      email           TEXT NOT NULL,
      business_name   TEXT NOT NULL,
      business_type   TEXT NOT NULL,
      phone           TEXT NOT NULL,
      city            TEXT NOT NULL,
      pain_points     TEXT,
      team_size       TEXT,
      referral_source TEXT,
      created_at      TIMESTAMPTZ DEFAULT now()
    )
  `;
  console.log('Migration complete: leads table ready');
}

migrate().catch((err: unknown) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add api/_db.ts scripts/migrate.ts
git commit -m "feat: add DB helper and leads table migration script"
```

---

## Task 3: TDD — Audit Handler

**Files:**
- Create: `api/audit.test.ts`
- Create: `api/audit.ts`

- [ ] **Step 1: Write `api/audit.test.ts`**

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// These variables start with 'mock' so Vitest hoists them alongside vi.mock()
const mockSql = vi.fn();
vi.mock('./_db', () => ({ sql: mockSql }));

const mockEmailSend = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockEmailSend },
  })),
}));

// Import handler after mocks are registered
import handler from './audit';

const VALID_BODY = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  businessName: 'Jane Salon',
  businessType: 'Salon',
  phone: '555-1234',
  city: 'Austin',
};

const REQUIRED_ENV: Record<string, string> = {
  POSTGRES_URL: 'postgres://localhost/test',
  RESEND_API_KEY: 'key_test',
  NOTIFY_EMAIL: 'owner@example.com',
  FROM_EMAIL: 'noreply@example.com',
};

function makeReq(overrides: Partial<{ method: string; body: unknown }> = {}): VercelRequest {
  return {
    method: 'POST',
    body: { ...VALID_BODY },
    ...overrides,
  } as unknown as VercelRequest;
}

function makeRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as VercelResponse, status, json };
}

describe('POST /api/audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockResolvedValue({ rows: [] });
    mockEmailSend.mockResolvedValue({ data: { id: '1' }, error: null });
    for (const [k, v] of Object.entries(REQUIRED_ENV)) process.env[k] = v;
  });

  afterEach(() => {
    for (const k of Object.keys(REQUIRED_ENV)) delete process.env[k];
  });

  it('returns 405 for non-POST methods', async () => {
    const { res, status, json } = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(status).toHaveBeenCalledWith(405);
    expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('returns 500 when a required env var is missing', async () => {
    delete process.env['RESEND_API_KEY'];
    const { res, status, json } = makeRes();
    await handler(makeReq(), res);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('returns 400 when a required field is missing', async () => {
    const { res, status } = makeRes();
    await handler(makeReq({ body: { ...VALID_BODY, city: '' } }), res);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for an invalid email address', async () => {
    const { res, status, json } = makeRes();
    await handler(makeReq({ body: { ...VALID_BODY, email: 'not-an-email' } }), res);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid email address' });
  });

  it('returns 200 and inserts a row for a valid payload', async () => {
    const { res, status, json } = makeRes();
    await handler(makeReq(), res);
    expect(mockSql).toHaveBeenCalledOnce();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true });
  });

  it('returns 200 even when email sending fails', async () => {
    mockEmailSend.mockRejectedValue(new Error('Resend unavailable'));
    const { res, status, json } = makeRes();
    await handler(makeReq(), res);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true });
  });

  it('returns 500 when the DB insert throws', async () => {
    mockSql.mockRejectedValue(new Error('connection refused'));
    const { res, status, json } = makeRes();
    await handler(makeReq(), res);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
npm run test:unit
```

Expected: 7 tests fail with an error like `Cannot find module './audit'` or similar. If any pass, something is wrong with the mock setup.

- [ ] **Step 3: Create `api/audit.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { sql } from './_db';
import type { AuditFormData } from '../src/types/content';

const REQUIRED_ENV = ['POSTGRES_URL', 'RESEND_API_KEY', 'NOTIFY_EMAIL', 'FROM_EMAIL'] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'businessName',
  'businessType',
  'phone',
  'city',
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.error(`Missing required env var: ${key}`);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  const body = req.body as Record<string, string | undefined>;

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || String(body[field]).trim() === '') {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  if (!EMAIL_RE.test(String(body['email']).trim())) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  const {
    fullName,
    email,
    businessName,
    businessType,
    phone,
    city,
    painPoints,
    teamSize,
    referralSource,
  } = body as unknown as AuditFormData;

  try {
    await sql`
      INSERT INTO leads
        (full_name, email, business_name, business_type, phone, city,
         pain_points, team_size, referral_source)
      VALUES
        (${fullName}, ${email}, ${businessName}, ${businessType}, ${phone}, ${city},
         ${painPoints ?? null}, ${teamSize ?? null}, ${referralSource ?? null})
    `;
  } catch (err) {
    console.error('DB insert failed:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  const resend = new Resend(process.env['RESEND_API_KEY']!);
  const firstName = fullName.split(' ')[0] ?? fullName;

  try {
    await Promise.all([
      resend.emails.send({
        from: process.env['FROM_EMAIL']!,
        to: process.env['NOTIFY_EMAIL']!,
        subject: `New audit request — ${businessName}`,
        html: buildInternalEmail(body as unknown as AuditFormData),
      }),
      resend.emails.send({
        from: process.env['FROM_EMAIL']!,
        to: email,
        subject: `We got your request, ${firstName}`,
        html: buildAckEmail(firstName),
      }),
    ]);
  } catch (err) {
    console.error('Email dispatch failed (non-blocking):', err);
  }

  res.status(200).json({ success: true });
}

function buildInternalEmail(data: AuditFormData): string {
  const rows: [string, string][] = [
    ['Full Name', data.fullName],
    ['Email', data.email],
    ['Business Name', data.businessName],
    ['Business Type', data.businessType],
    ['Phone', data.phone],
    ['City', data.city],
  ];
  if (data.painPoints) rows.push(['Pain Points', data.painPoints]);
  if (data.teamSize) rows.push(['Team Size', data.teamSize]);
  if (data.referralSource) rows.push(['Referral Source', data.referralSource]);

  const tableRows = rows
    .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${value}</td></tr>`)
    .join('');

  return `<h2>New Audit Request</h2><table><tbody>${tableRows}</tbody></table>`;
}

function buildAckEmail(firstName: string): string {
  return (
    `<p>Hi ${firstName},</p>` +
    `<p>Thanks for reaching out to TaylorMade. ` +
    `We'll review your business and be in touch within 24 hours.</p>`
  );
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
npm run test:unit
```

Expected: 7 tests pass. If any fail, check the error and fix before continuing.

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add api/audit.ts api/audit.test.ts
git commit -m "feat: add audit serverless handler with Vitest coverage"
```

---

## Task 4: Deploy to Vercel

These steps are performed in the browser/CLI and do not produce committed code.

- [ ] **Step 1: Push current branch to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Create Vercel project**

Go to [vercel.com/new](https://vercel.com/new), import the `Skigim/taylor-made` GitHub repository. Vercel detects Vite automatically via `vercel.json`.

- [ ] **Step 3: Provision Vercel Postgres**

In the Vercel project dashboard → **Storage** → **Create Database** → choose **Postgres (Neon)**. Accept defaults. Vercel sets `POSTGRES_URL` automatically in the project environment.

- [ ] **Step 4: Set remaining environment variables**

In Vercel project settings → **Environment Variables**, add:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (from resend.com/api-keys) |
| `NOTIFY_EMAIL` | The TaylorMade inbox address |
| `FROM_EMAIL` | A sender address verified in your Resend account |

- [ ] **Step 5: Run the migration against the production database**

Copy the `POSTGRES_URL` connection string from Vercel project settings → Environment Variables, then run:

```bash
POSTGRES_URL="<paste connection string here>" npx tsx scripts/migrate.ts
```

Expected output:
```
Migration complete: leads table ready
```

- [ ] **Step 6: Verify the deployment**

Trigger a Vercel deploy (push a commit or manually redeploy from the dashboard). Once live, open the site, submit the audit form with a real email address, and confirm:
1. The form transitions to the success state
2. An internal notification email arrives at `NOTIFY_EMAIL`
3. An acknowledgment email arrives at the submitted address
4. A row appears in the `leads` table (Vercel dashboard → Storage → your database → Data)
