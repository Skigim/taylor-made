# Audit Request Form Design

## Overview

The audit request form collects lead information from prospective clients who click any "Get a free systems audit" CTA on the TaylorMade landing page. The form appears in a modal dialog, gathers required contact and business details, and POSTs the submission as JSON to a configurable backend API endpoint for CRM ingestion. On success, the form is replaced with a confirmation message.

## Architecture

The form adds three new files to the existing Vite/TypeScript site and does not introduce routing, new pages, or external form libraries.

### New files

- `src/components/auditModal.ts` — modal DOM construction, open/close/focus-trap logic
- `src/components/auditForm.ts` — form field construction, validation state, submit handler
- `src/styles/modal.css` — modal overlay, card, and form field styles (imported into `src/styles.css`)
- `src/config.ts` — single constant for the API endpoint URL (e.g. `export const AUDIT_API_URL = '/api/audit'`)

### Integration points

- `src/main.ts` imports and initializes the modal; attaches open triggers to all existing CTA buttons
- `src/styles.css` imports `src/styles/modal.css`

## Fields

### Required section (always visible)

| Field | Input type | Validation |
|---|---|---|
| Full Name | `text` | Required, minimum 2 characters |
| Email | `email` | Required, valid email format |
| Business Name | `text` | Required |
| Business Type | `select` | Required; options: Salon, Barber Shop, Other |
| Phone | `tel` | Required, basic format (digits, spaces, dashes, parens, plus sign) |
| City / Location | `text` | Required |

### Optional section (collapsed by default, expanded via toggle)

| Field | Input type |
|---|---|
| Current pain points | `textarea` (free text, no validation) |
| Team size | `select`; options: Just me, 2–5, 6–10, 10+ |
| How did you hear about us? | `select`; options: Google, Referral, Social media, Other |

The optional section is revealed by a "Tell us more about your business" toggle (chevron icon + label). Expanding/collapsing is purely visual — no fields in this section affect validation or submit eligibility.

## Submit State Flow

1. **Idle** — form ready, submit button disabled until all required fields are valid
2. **Submitting** — button shows "Sending…" and is disabled; all fields disabled to prevent edits mid-flight
3. **Success** — form content replaced with a confirmation panel: heading "You're all set", body "We'll review your business and be in touch within 24 hours."
4. **Error** — inline error message displayed above the submit button ("Something went wrong — please try again."); form re-enabled so the user can retry

## Validation UX

- Validation runs on field blur, not on every keystroke
- Error messages appear below the relevant field
- The submit button remains disabled until all required fields pass validation
- No field is pre-filled or auto-populated

## Modal Behavior

- Triggered by any element with `data-action="open-audit-modal"` (applied to all existing CTA buttons in `main.ts`)
- Centered overlay with a semi-transparent dark backdrop (`rgba(0,0,0,0.5)`)
- Close via: ✕ button (top-right of modal card), clicking the backdrop, or pressing Escape
- Body scroll locked while modal is open (`overflow: hidden` on `<body>`)
- Focus trapped inside the modal while open; focus returns to the trigger element on close
- Modal resets to its idle state (empty fields, collapsed optional section) each time it is opened

## Visual Style

- Modal card uses existing CSS custom properties (color tokens, font stack, spacing scale)
- Card background: `--color-surface` (off-white / white)
- Card border-radius, shadow, and padding match the existing `.card` component style
- Modal heading: "Request your free audit" with subline "No pressure, no pitch — just a clear look at where your systems stand."
- Required field labels, inputs, and focus states match the existing site's form aesthetic
- Optional section toggle uses a chevron that rotates on expand
- Submit button uses the existing `.btn-primary` style
- Error text uses `--color-error` (muted red; to be added to the token set if not already present)

## API Contract

The form POSTs to `AUDIT_API_URL` (from `src/config.ts`) with `Content-Type: application/json`.

### Request body

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

### Expected responses

- `2xx` — treated as success, transitions to success state
- Any non-2xx or network error — transitions to error state, form re-enabled

## Testing

Playwright tests in `tests/audit-form.spec.ts` cover:

- Modal opens on CTA button click
- Modal closes on ✕ button, backdrop click, and Escape key
- Required field validation: submit button disabled until all required fields filled
- Error message appears on blur for an invalid email
- Optional section expands and collapses on toggle click
- Successful submit (mocked API) transitions to success state
- Failed submit (mocked API) shows error message and re-enables form
