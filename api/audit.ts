import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { sql } from './_db.js';
import type { AuditFormData } from '../src/types/content';

const REQUIRED_ENV = ['DATABASE_URL', 'RESEND_API_KEY', 'NOTIFY_EMAIL', 'FROM_EMAIL'] as const;

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
