# Audit Request Form Backend Design

## Overview

When a prospective client submits the audit request form, the backend persists the lead to a database and sends two emails: an internal alert to TaylorMade and a confirmation to the submitter. The serverless function lives at `api/audit.ts`, which maps directly to the existing frontend `AUDIT_API_URL = '/api/audit'` — no frontend changes required.

The site moves from GitHub Pages to **Vercel** for hosting, enabling serverless functions alongside the Vite-built static site. Leads are stored in **Vercel Postgres** (Neon). Transactional email is handled by **Resend**.

## New Files

| File | Purpose |
|---|---|
| `api/audit.ts` | Serverless function — validates input, inserts lead, dispatches emails |
| `api/_db.ts` | Shared Vercel Postgres client |
| `scripts/migrate.ts` | One-time script to create the `leads` table |
| `vercel.json` | Vercel project configuration |

## Dependencies Added

**Production:**
- `@vercel/postgres` — Vercel Postgres client
- `resend` — Resend email SDK

**Dev:**
- `tsx` — TypeScript executor for running `scripts/migrate.ts` directly

## Database Schema

Table: `leads`

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` |
| `full_name` | `TEXT` | `NOT NULL` |
| `email` | `TEXT` | `NOT NULL` |
| `business_name` | `TEXT` | `NOT NULL` |
| `business_type` | `TEXT` | `NOT NULL` |
| `phone` | `TEXT` | `NOT NULL` |
| `city` | `TEXT` | `NOT NULL` |
| `pain_points` | `TEXT` | nullable |
| `team_size` | `TEXT` | nullable |
| `referral_source` | `TEXT` | nullable |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` |

## API: `POST /api/audit`

### Request

`Content-Type: application/json`. Body mirrors the existing frontend `AuditFormData` type:

```json
{
  "fullName": "string",
  "email": "string",
  "businessName": "string",
  "businessType": "Salon | Barber Shop | Other",
  "phone": "string",
  "city": "string",
  "painPoints": "string | undefined",
  "teamSize": "Just me | 2–5 | 6–10 | 10+ | undefined",
  "referralSource": "Google | Referral | Social media | Other | undefined"
}
```

### Server-Side Validation

Required fields: `fullName`, `email`, `businessName`, `businessType`, `phone`, `city`. If any are missing or empty, return `400`. Email format validated with the same regex as the frontend (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).

### Processing Order

1. Check all required environment variables are present → `500` if any missing
2. Parse and validate request body → `400` on failure
3. Insert row into `leads` table → `500` on DB error
4. Send internal notification and acknowledgment emails in parallel via `Promise.all`
5. Return `200 { success: true }`

**Email failure handling:** If the DB insert succeeds but Resend returns an error (network failure, delivery error), the function logs the error and still returns `200`. The lead is persisted; email failure is non-blocking. This prevents duplicate submissions from a user retrying a form that already saved.

### Responses

| Status | Condition |
|---|---|
| `200` | Lead stored; emails attempted (email failures are non-blocking) |
| `400` | Missing or invalid required field |
| `405` | Non-POST method |
| `500` | Missing env var, or DB failure |

## Email Templates

### Internal Notification (to TaylorMade)

- **From:** `FROM_EMAIL` env var
- **To:** `NOTIFY_EMAIL` env var
- **Subject:** `New audit request — {businessName}`
- **Body (HTML):** Simple formatted list of all submitted fields. Optional fields shown only if present.

### Submitter Acknowledgment

- **From:** `FROM_EMAIL` env var
- **To:** submitter's email address
- **Subject:** `We got your request, {firstName}` (first word of `fullName`)
- **Body (HTML):** "Thanks for reaching out to TaylorMade. We'll review your business and be in touch within 24 hours."

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | Vercel Postgres connection string (provided by Vercel dashboard) |
| `RESEND_API_KEY` | Resend API key |
| `NOTIFY_EMAIL` | TaylorMade inbox that receives lead alerts |
| `FROM_EMAIL` | Verified sender address in Resend (e.g. `hello@taylormadellc.com`) |

All four must be set. Missing any causes the function to return `500` before attempting DB or email operations.

## Vercel Configuration

`vercel.json` at the project root declares `"framework": "vite"` so Vercel runs `vite build` and serves the output from `dist/`. No rewrites needed — Vercel's file-system routing maps `api/audit.ts` to `/api/audit` automatically.

## Migration

`scripts/migrate.ts` is a standalone script (not part of the Vite build) that creates the `leads` table using `CREATE TABLE IF NOT EXISTS`. Run once manually after provisioning Vercel Postgres:

```sh
npx tsx scripts/migrate.ts
```

Uses the same `POSTGRES_URL` environment variable.

## Testing

Existing Playwright tests in `tests/audit-form.spec.ts` already mock the API and cover frontend success/error states — no changes needed there.

The API function is covered by unit tests in `api/audit.test.ts` (Vitest):

- Returns `405` for non-POST requests
- Returns `400` when required fields are missing
- Returns `400` for invalid email format
- Returns `200` and calls DB insert + Resend on valid payload (DB and Resend injected as stubs)
- Returns `200` even when Resend throws (DB insert succeeded)
- Returns `500` when DB insert throws

## Deployment Checklist

1. `npm install @vercel/postgres resend`
2. Add `api/_db.ts`, `api/audit.ts`, `scripts/migrate.ts`, `vercel.json`
3. Connect the GitHub repo to a new Vercel project
4. Provision Vercel Postgres from the Vercel dashboard
5. Set `POSTGRES_URL`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL` in Vercel project settings
6. Run `npx tsx scripts/migrate.ts` with the production `POSTGRES_URL`
7. Push to `main` — Vercel auto-deploys
