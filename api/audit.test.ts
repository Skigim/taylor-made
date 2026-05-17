import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock modules before any imports that reference them
vi.mock('./_db', () => ({ sql: vi.fn() }));
vi.mock('resend', () => ({ Resend: vi.fn() }));

import handler from './audit';
import { sql } from './_db';
import { Resend } from 'resend';

// Declared at describe scope so individual tests can override per-test
let mockEmailSend: ReturnType<typeof vi.fn>;

const VALID_BODY = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  businessName: 'Jane Salon',
  businessType: 'Salon',
  phone: '555-1234',
  city: 'Austin',
};

const REQUIRED_ENV: Record<string, string> = {
  DATABASE_URL: 'postgres://localhost/test',
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
    vi.mocked(sql).mockResolvedValue([]);
    mockEmailSend = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });
    vi.mocked(Resend).mockImplementation(
      class {
        emails = { send: mockEmailSend };
      } as unknown as typeof Resend,
    );
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
    expect(vi.mocked(sql)).toHaveBeenCalledOnce();
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
    vi.mocked(sql).mockRejectedValue(new Error('connection refused'));
    const { res, status, json } = makeRes();
    await handler(makeReq(), res);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
