import { neon } from '@neondatabase/serverless';

const url = process.env['DATABASE_URL'];
if (!url) {
  console.error('DATABASE_URL env var is required');
  process.exit(1);
}

const sql = neon(url);

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
