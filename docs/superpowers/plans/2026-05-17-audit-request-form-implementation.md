# Audit Request Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modal audit request form to the TaylorMade landing page that collects lead information and POSTs it as JSON to a configurable backend API endpoint.

**Architecture:** Four new source files (config constant, modal component, form component, modal CSS) alongside targeted changes to `main.ts`, `styles.css`, and `types/content.ts`. CTA buttons gain `data-action="open-audit-modal"`; `main.ts` wires them to the modal. No routing, no libraries beyond what already exists.

**Tech Stack:** TypeScript, Vite, CSS custom properties, Playwright

---

## File Structure

### New files
- Create: `src/config.ts` — API endpoint constant
- Create: `src/components/auditModal.ts` — modal DOM, open/close, focus trap, scroll lock
- Create: `src/components/auditForm.ts` — form fields, validation, submit handler
- Create: `src/styles/modal.css` — modal overlay, card, and form styles
- Create: `tests/audit-form.spec.ts` — Playwright tests for all form behaviors

### Modified files
- Modify: `src/types/content.ts` — add `AuditFormData`, `BusinessType`, `TeamSize`, `ReferralSource`
- Modify: `src/styles.css` — add `--color-error` token and `@import` for `modal.css`
- Modify: `src/main.ts` — import components, change `data-action` on both CTA buttons, wire modal, remove dead code
- Modify: `tests/landing-page.spec.ts` — update two CTA tests from focus/scroll behavior to modal opening

---

## Task 1: Config, types, and CSS error token

**Files:**
- Create: `src/config.ts`
- Modify: `src/types/content.ts`
- Modify: `src/styles.css`

No behavior yet — pure data and style setup. No tests needed.

- [ ] **Step 1: Create `src/config.ts`**

```typescript
export const AUDIT_API_URL = '/api/audit';
```

- [ ] **Step 2: Add `AuditFormData` and supporting types to the bottom of `src/types/content.ts`**

```typescript
export type BusinessType = 'Salon' | 'Barber Shop' | 'Other';
export type TeamSize = 'Just me' | '2–5' | '6–10' | '10+';
export type ReferralSource = 'Google' | 'Referral' | 'Social media' | 'Other';

export interface AuditFormData {
  fullName: string;
  email: string;
  businessName: string;
  businessType: BusinessType;
  phone: string;
  city: string;
  painPoints?: string;
  teamSize?: TeamSize;
  referralSource?: ReferralSource;
}
```

- [ ] **Step 3: Add `--color-error` token to `:root` in `src/styles.css`**

Add one line inside the existing `:root {}` block, after `--color-accent`:

```css
  --color-error: #b84c3a;
```

The `:root` block should now read:

```css
:root {
  --color-ink: #15202a;
  --color-ink-soft: #274150;
  --color-paper: #f5efe3;
  --color-paper-strong: #eadfca;
  --color-parchment: #f8f3ea;
  --color-text: #162028;
  --color-muted: #5f6d74;
  --color-accent: #d4af37;
  --color-error: #b84c3a;
  --font-display: 'Playfair Display', 'Georgia', serif;
  --font-body: 'Manrope', 'Montserrat', sans-serif;
}
```

- [ ] **Step 4: Add `@import` for modal styles as the very first line of `src/styles.css`**

```css
@import './styles/modal.css';
```

This must appear before all other rules (before `:root`).

- [ ] **Step 5: Commit**

```bash
git add src/config.ts src/types/content.ts src/styles.css
git commit -m "feat: add audit form config, types, and error color token"
```

---

## Task 2: Modal shell wired into main.ts (TDD)

**Files:**
- Create: `src/components/auditModal.ts`
- Create: `src/components/auditForm.ts` (stub — returns empty form)
- Create: `src/styles/modal.css` (layout skeleton only)
- Create: `tests/audit-form.spec.ts`
- Modify: `src/main.ts`
- Modify: `tests/landing-page.spec.ts`

- [ ] **Step 1: Write the failing tests in `tests/audit-form.spec.ts`**

```typescript
import { expect, test } from '@playwright/test';

test('audit modal opens when a CTA button is clicked', async ({ page }) => {
  await page.goto('/');
  const modal = page.locator('#audit-modal');
  await expect(modal).toBeHidden();
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await expect(modal).toBeVisible();
});

test('audit modal closes when the close button is clicked', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  const modal = page.locator('#audit-modal');
  await expect(modal).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();
  await expect(modal).toBeHidden();
});

test('audit modal closes when the backdrop is clicked', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  const modal = page.locator('#audit-modal');
  await expect(modal).toBeVisible();
  await modal.click({ position: { x: 4, y: 4 } });
  await expect(modal).toBeHidden();
});

test('audit modal closes when Escape is pressed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  const modal = page.locator('#audit-modal');
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('audit form resets when the modal is reopened', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await page.fill('#audit-full-name', 'Jane Smith');
  await page.getByRole('button', { name: /close/i }).click();
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await expect(page.locator('#audit-full-name')).toHaveValue('');
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```
npx playwright test tests/audit-form.spec.ts --reporter=list
```

Expected: all 5 tests FAIL — no `#audit-modal` element exists yet.

- [ ] **Step 3: Create `src/components/auditModal.ts`**

```typescript
export interface AuditModal {
  element: HTMLElement;
  open: (trigger: HTMLElement) => void;
  close: () => void;
}

// createForm is called on every open() so the form starts fresh each time.
export function createAuditModal(createForm: () => HTMLElement): AuditModal {
  let triggerElement: HTMLElement | null = null;

  const overlay = document.createElement('div');
  overlay.id = 'audit-modal';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'audit-modal-title');
  overlay.hidden = true;

  const card = document.createElement('div');
  card.className = 'modal-card';

  const header = document.createElement('div');
  header.className = 'modal-header';

  const title = document.createElement('h2');
  title.id = 'audit-modal-title';
  title.className = 'modal-title';
  title.textContent = 'Request your free audit';

  const subline = document.createElement('p');
  subline.className = 'modal-subline';
  subline.textContent =
    'No pressure, no pitch \u2014 just a clear look at where your systems stand.';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&times;';

  header.append(title, subline, closeBtn);
  overlay.append(card);

  const getFocusable = (): HTMLElement[] =>
    Array.from(
      card.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const open = (trigger: HTMLElement) => {
    triggerElement = trigger;
    // Replace form with a fresh instance so the modal always opens clean.
    const existingForm = card.querySelector('.audit-form');
    if (existingForm) card.removeChild(existingForm);
    card.append(header, createForm());
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);
    const firstFocusable = getFocusable()[0];
    if (firstFocusable) firstFocusable.focus();
  };

  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeydown);
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { element: overlay, open, close };
}
```

- [ ] **Step 4: Create the stub `src/components/auditForm.ts`**

```typescript
export function createAuditForm(_onClose: () => void): HTMLElement {
  const form = document.createElement('form');
  form.className = 'audit-form';
  return form;
}
```

- [ ] **Step 5: Create `src/styles/modal.css` with overlay layout skeleton**

```css
.modal-overlay[hidden] {
  display: none;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-card {
  background: var(--color-parchment);
  border-radius: 4px;
  max-width: 540px;
  width: 100%;
  padding: 2rem;
  position: relative;
}
```

- [ ] **Step 6: Modify `src/main.ts`**

Add these two imports directly after the existing `import { escapeHtml } from './lib/html';` line:

```typescript
import { createAuditModal } from './components/auditModal';
import { createAuditForm } from './components/auditForm';
```

Remove the entire `isMeaningfullyVisible` function (the block starting with `const isMeaningfullyVisible = (element: HTMLElement) => {` through its closing `};`).

In the `app.innerHTML` template string, find the hero CTA button and change its `aria-controls` and `data-action` attributes:

Old:
```
            aria-controls="audit-overview"
            data-action="focus-audit-overview"
```

New:
```
            aria-haspopup="dialog"
            aria-controls="audit-modal"
            data-action="open-audit-modal"
```

In the `app.innerHTML` template string, find the closing CTA button and apply the same attribute change:

Old:
```
        aria-controls="audit-overview"
        data-action="focus-audit-overview"
```

New:
```
        aria-haspopup="dialog"
        aria-controls="audit-modal"
        data-action="open-audit-modal"
```

Replace the entire block from `const auditCtaButtons = app.querySelectorAll...` through the final `auditCtaButtons.forEach(...)` line at the bottom of the file with:

```typescript
const auditCtaButtons = app.querySelectorAll<HTMLButtonElement>(
  '[data-action="open-audit-modal"]'
);

if (!auditCtaButtons.length) {
  throw new Error('Missing audit CTA buttons');
}

// createAuditModal accepts a factory so each open() gets a fresh form.
let auditModal: ReturnType<typeof createAuditModal>;
const formFactory = () => createAuditForm(() => auditModal.close());
auditModal = createAuditModal(formFactory);
document.body.append(auditModal.element);

auditCtaButtons.forEach((btn) =>
  btn.addEventListener('click', () => auditModal.open(btn))
);
```

- [ ] **Step 7: Update the two CTA behavior tests in `tests/landing-page.spec.ts`**

Replace the test `'hero CTA focuses the audit overview without desktop scroll jumps'` with:

```typescript
test('hero CTA opens the audit modal', async ({ page }) => {
  await page.goto('/');
  const modal = page.locator('#audit-modal');
  await expect(modal).toBeHidden();
  const primaryCta = page.locator('section.hero').getByRole('button', {
    name: /get a free systems audit/i,
  });
  await primaryCta.click();
  await expect(modal).toBeVisible();
});
```

Replace the test `'hero CTA scrolls the audit overview into view on narrow screens before focusing it'` with:

```typescript
test('hero CTA opens the audit modal on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 540 });
  await page.goto('/');
  const modal = page.locator('#audit-modal');
  await expect(modal).toBeHidden();
  const primaryCta = page.locator('section.hero').getByRole('button', {
    name: /get a free systems audit/i,
  });
  await primaryCta.click();
  await expect(modal).toBeVisible();
});
```

- [ ] **Step 8: Run all tests**

```
npx playwright test --reporter=list
```

Expected: all tests in `tests/audit-form.spec.ts` PASS, all tests in `tests/landing-page.spec.ts` PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/auditModal.ts src/components/auditForm.ts src/styles/modal.css src/main.ts tests/audit-form.spec.ts tests/landing-page.spec.ts
git commit -m "feat: add audit modal shell and wire CTA buttons"
```

---

## Task 3: Form fields and optional toggle (TDD)

**Files:**
- Modify: `src/components/auditForm.ts`
- Modify: `tests/audit-form.spec.ts`

- [ ] **Step 1: Add field presence and toggle tests to `tests/audit-form.spec.ts`**

Append these tests to the existing file:

```typescript
test('audit form contains all required fields', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await expect(page.locator('#audit-full-name')).toBeVisible();
  await expect(page.locator('#audit-email')).toBeVisible();
  await expect(page.locator('#audit-business-name')).toBeVisible();
  await expect(page.locator('#audit-business-type')).toBeVisible();
  await expect(page.locator('#audit-phone')).toBeVisible();
  await expect(page.locator('#audit-city')).toBeVisible();
});

test('optional section is hidden by default and expands on toggle', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  const optionalFields = page.locator('#audit-optional-fields');
  await expect(optionalFields).toBeHidden();
  await page.getByRole('button', { name: /tell us more about your business/i }).click();
  await expect(optionalFields).toBeVisible();
  await expect(page.locator('#audit-pain-points')).toBeVisible();
  await expect(page.locator('#audit-team-size')).toBeVisible();
  await expect(page.locator('#audit-referral')).toBeVisible();
});
```

- [ ] **Step 2: Run new tests to confirm they fail**

```
npx playwright test tests/audit-form.spec.ts --reporter=list
```

Expected: `audit form contains all required fields` FAILS, `optional section...` FAILS. The 4 modal tests from Task 2 still PASS.

- [ ] **Step 3: Replace `src/components/auditForm.ts` with the full field implementation**

```typescript
export function createAuditForm(_onClose: () => void): HTMLElement {
  const form = document.createElement('form');
  form.className = 'audit-form';
  form.noValidate = true;

  form.innerHTML = `
    <fieldset class="audit-form__fieldset">
      <div class="audit-form__required">
        <div class="form-field">
          <label for="audit-full-name">Full Name</label>
          <input id="audit-full-name" name="fullName" type="text" autocomplete="name" required />
          <p class="form-field__error" id="audit-full-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-email">Email</label>
          <input id="audit-email" name="email" type="email" autocomplete="email" required />
          <p class="form-field__error" id="audit-email-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-name">Business Name</label>
          <input id="audit-business-name" name="businessName" type="text" autocomplete="organization" required />
          <p class="form-field__error" id="audit-business-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-type">Business Type</label>
          <select id="audit-business-type" name="businessType" required>
            <option value="">Select one</option>
            <option value="Salon">Salon</option>
            <option value="Barber Shop">Barber Shop</option>
            <option value="Other">Other</option>
          </select>
          <p class="form-field__error" id="audit-business-type-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-phone">Phone</label>
          <input id="audit-phone" name="phone" type="tel" autocomplete="tel" required />
          <p class="form-field__error" id="audit-phone-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-city">City / Location</label>
          <input id="audit-city" name="city" type="text" autocomplete="address-level2" required />
          <p class="form-field__error" id="audit-city-error" aria-live="polite"></p>
        </div>
      </div>
      <div class="audit-form__optional">
        <button
          type="button"
          class="audit-form__optional-toggle"
          aria-expanded="false"
          aria-controls="audit-optional-fields"
        >
          <span>Tell us more about your business</span>
          <svg class="audit-form__chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div id="audit-optional-fields" class="audit-form__optional-fields" hidden>
          <div class="form-field">
            <label for="audit-pain-points">
              What's your biggest pain point right now?
              <span class="form-field__optional">(optional)</span>
            </label>
            <textarea id="audit-pain-points" name="painPoints" rows="3"></textarea>
          </div>
          <div class="form-field">
            <label for="audit-team-size">
              Team size <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-team-size" name="teamSize">
              <option value="">Select one</option>
              <option value="Just me">Just me</option>
              <option value="2\u20135">2\u20135</option>
              <option value="6\u201310">6\u201310</option>
              <option value="10+">10+</option>
            </select>
          </div>
          <div class="form-field">
            <label for="audit-referral">
              How did you hear about us?
              <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-referral" name="referralSource">
              <option value="">Select one</option>
              <option value="Google">Google</option>
              <option value="Referral">Referral</option>
              <option value="Social media">Social media</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </fieldset>
    <div class="audit-form__footer">
      <p class="audit-form__submit-error" aria-live="polite" hidden></p>
      <button type="submit" class="button button--primary audit-form__submit" disabled>
        Get my free audit
      </button>
    </div>
  `;

  const optionalToggle = form.querySelector<HTMLButtonElement>('.audit-form__optional-toggle')!;
  const optionalFields = form.querySelector<HTMLElement>('#audit-optional-fields')!;

  optionalToggle.addEventListener('click', () => {
    const expanded = optionalToggle.getAttribute('aria-expanded') === 'true';
    optionalToggle.setAttribute('aria-expanded', String(!expanded));
    optionalFields.hidden = expanded;
  });

  return form;
}
```

- [ ] **Step 4: Run all tests**

```
npx playwright test --reporter=list
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/auditForm.ts tests/audit-form.spec.ts
git commit -m "feat: add audit form fields and optional section toggle"
```

---

## Task 4: Validation — blur errors and submit button state (TDD)

**Files:**
- Modify: `src/components/auditForm.ts`
- Modify: `tests/audit-form.spec.ts`

- [ ] **Step 1: Add validation tests to `tests/audit-form.spec.ts`**

Append these tests to the existing file:

```typescript
test('submit button is disabled until all required fields are valid', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  const submitBtn = page.getByRole('button', { name: /get my free audit/i });
  await expect(submitBtn).toBeDisabled();

  await page.fill('#audit-full-name', 'Jane Smith');
  await page.fill('#audit-email', 'jane@example.com');
  await page.fill('#audit-business-name', 'Smith Salon');
  await page.selectOption('#audit-business-type', 'Salon');
  await page.fill('#audit-phone', '555-1234');
  await page.fill('#audit-city', 'Chicago');

  await expect(submitBtn).toBeEnabled();
});

test('email field shows an error on blur when the value is invalid', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await page.fill('#audit-email', 'not-an-email');
  await page.locator('#audit-email').blur();
  await expect(page.locator('#audit-email-error')).toHaveText(
    'Please enter a valid email address.'
  );
});

test('email error is cleared after a valid value is entered and blurred', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await page.fill('#audit-email', 'not-an-email');
  await page.locator('#audit-email').blur();
  await expect(page.locator('#audit-email-error')).not.toBeEmpty();
  await page.fill('#audit-email', 'jane@example.com');
  await page.locator('#audit-email').blur();
  await expect(page.locator('#audit-email-error')).toBeEmpty();
});
```

- [ ] **Step 2: Run new tests to confirm they fail**

```
npx playwright test tests/audit-form.spec.ts --reporter=list
```

Expected: the 3 new validation tests FAIL. Existing tests PASS.

- [ ] **Step 3: Replace `src/components/auditForm.ts` with the validation layer added**

```typescript
type ValidatorFn = (value: string) => string;

const validators: Record<string, ValidatorFn> = {
  fullName: (v) => (v.trim().length >= 2 ? '' : 'Please enter your full name.'),
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ''
      : 'Please enter a valid email address.',
  businessName: (v) => (v.trim().length > 0 ? '' : 'Please enter your business name.'),
  businessType: (v) => (v !== '' ? '' : 'Please select a business type.'),
  phone: (v) =>
    /^[0-9\s\-()+]{7,}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.',
  city: (v) => (v.trim().length > 0 ? '' : 'Please enter your city or location.'),
};

interface FieldDescriptor {
  name: string;
  inputId: string;
  errorId: string;
}

const REQUIRED_FIELDS: FieldDescriptor[] = [
  { name: 'fullName', inputId: 'audit-full-name', errorId: 'audit-full-name-error' },
  { name: 'email', inputId: 'audit-email', errorId: 'audit-email-error' },
  { name: 'businessName', inputId: 'audit-business-name', errorId: 'audit-business-name-error' },
  { name: 'businessType', inputId: 'audit-business-type', errorId: 'audit-business-type-error' },
  { name: 'phone', inputId: 'audit-phone', errorId: 'audit-phone-error' },
  { name: 'city', inputId: 'audit-city', errorId: 'audit-city-error' },
];

export function createAuditForm(_onClose: () => void): HTMLElement {
  const form = document.createElement('form');
  form.className = 'audit-form';
  form.noValidate = true;

  form.innerHTML = `
    <fieldset class="audit-form__fieldset">
      <div class="audit-form__required">
        <div class="form-field">
          <label for="audit-full-name">Full Name</label>
          <input id="audit-full-name" name="fullName" type="text" autocomplete="name" required />
          <p class="form-field__error" id="audit-full-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-email">Email</label>
          <input id="audit-email" name="email" type="email" autocomplete="email" required />
          <p class="form-field__error" id="audit-email-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-name">Business Name</label>
          <input id="audit-business-name" name="businessName" type="text" autocomplete="organization" required />
          <p class="form-field__error" id="audit-business-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-type">Business Type</label>
          <select id="audit-business-type" name="businessType" required>
            <option value="">Select one</option>
            <option value="Salon">Salon</option>
            <option value="Barber Shop">Barber Shop</option>
            <option value="Other">Other</option>
          </select>
          <p class="form-field__error" id="audit-business-type-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-phone">Phone</label>
          <input id="audit-phone" name="phone" type="tel" autocomplete="tel" required />
          <p class="form-field__error" id="audit-phone-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-city">City / Location</label>
          <input id="audit-city" name="city" type="text" autocomplete="address-level2" required />
          <p class="form-field__error" id="audit-city-error" aria-live="polite"></p>
        </div>
      </div>
      <div class="audit-form__optional">
        <button
          type="button"
          class="audit-form__optional-toggle"
          aria-expanded="false"
          aria-controls="audit-optional-fields"
        >
          <span>Tell us more about your business</span>
          <svg class="audit-form__chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div id="audit-optional-fields" class="audit-form__optional-fields" hidden>
          <div class="form-field">
            <label for="audit-pain-points">
              What's your biggest pain point right now?
              <span class="form-field__optional">(optional)</span>
            </label>
            <textarea id="audit-pain-points" name="painPoints" rows="3"></textarea>
          </div>
          <div class="form-field">
            <label for="audit-team-size">
              Team size <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-team-size" name="teamSize">
              <option value="">Select one</option>
              <option value="Just me">Just me</option>
              <option value="2\u20135">2\u20135</option>
              <option value="6\u201310">6\u201310</option>
              <option value="10+">10+</option>
            </select>
          </div>
          <div class="form-field">
            <label for="audit-referral">
              How did you hear about us?
              <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-referral" name="referralSource">
              <option value="">Select one</option>
              <option value="Google">Google</option>
              <option value="Referral">Referral</option>
              <option value="Social media">Social media</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </fieldset>
    <div class="audit-form__footer">
      <p class="audit-form__submit-error" aria-live="polite" hidden></p>
      <button type="submit" class="button button--primary audit-form__submit" disabled>
        Get my free audit
      </button>
    </div>
  `;

  const submitBtn = form.querySelector<HTMLButtonElement>('.audit-form__submit')!;
  const optionalToggle = form.querySelector<HTMLButtonElement>('.audit-form__optional-toggle')!;
  const optionalFields = form.querySelector<HTMLElement>('#audit-optional-fields')!;

  optionalToggle.addEventListener('click', () => {
    const expanded = optionalToggle.getAttribute('aria-expanded') === 'true';
    optionalToggle.setAttribute('aria-expanded', String(!expanded));
    optionalFields.hidden = expanded;
  });

  const getInput = (id: string) =>
    form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`#${id}`);

  const validateField = (descriptor: FieldDescriptor): boolean => {
    const field = getInput(descriptor.inputId);
    const errorEl = form.querySelector<HTMLElement>(`#${descriptor.errorId}`);
    if (!field || !errorEl) return true;
    const validate = validators[descriptor.name];
    if (!validate) return true;
    const error = validate(field.value);
    errorEl.textContent = error;
    return error === '';
  };

  const updateSubmitState = () => {
    const allValid = REQUIRED_FIELDS.every((d) => {
      const field = getInput(d.inputId);
      const validate = validators[d.name];
      return field && validate && validate(field.value) === '';
    });
    submitBtn.disabled = !allValid;
  };

  REQUIRED_FIELDS.forEach((descriptor) => {
    const field = getInput(descriptor.inputId);
    if (!field) return;
    field.addEventListener('blur', () => {
      validateField(descriptor);
      updateSubmitState();
    });
    field.addEventListener('input', updateSubmitState);
    field.addEventListener('change', updateSubmitState);
  });

  return form;
}
```

- [ ] **Step 4: Run all tests**

```
npx playwright test --reporter=list
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/auditForm.ts tests/audit-form.spec.ts
git commit -m "feat: add audit form validation with blur errors and submit state"
```

---

## Task 5: Submit handler — success and error states (TDD)

**Files:**
- Modify: `src/components/auditForm.ts`
- Modify: `tests/audit-form.spec.ts`

- [ ] **Step 1: Add submit tests to `tests/audit-form.spec.ts`**

Append these tests to the existing file:

```typescript
test('audit form shows success state after a successful submit', async ({ page }) => {
  await page.route('/api/audit', (route) =>
    route.fulfill({ status: 200, body: '{}', contentType: 'application/json' })
  );
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();

  await page.fill('#audit-full-name', 'Jane Smith');
  await page.fill('#audit-email', 'jane@example.com');
  await page.fill('#audit-business-name', 'Smith Salon');
  await page.selectOption('#audit-business-type', 'Salon');
  await page.fill('#audit-phone', '555-1234');
  await page.fill('#audit-city', 'Chicago');

  await page.getByRole('button', { name: /get my free audit/i }).click();

  await expect(page.getByRole('heading', { name: /you're all set/i })).toBeVisible();
  await expect(
    page.getByText(/we'll review your business and be in touch within 24 hours/i)
  ).toBeVisible();
});

test('audit form shows error message and re-enables when submit fails', async ({ page }) => {
  await page.route('/api/audit', (route) =>
    route.fulfill({ status: 500, body: '{}', contentType: 'application/json' })
  );
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();

  await page.fill('#audit-full-name', 'Jane Smith');
  await page.fill('#audit-email', 'jane@example.com');
  await page.fill('#audit-business-name', 'Smith Salon');
  await page.selectOption('#audit-business-type', 'Salon');
  await page.fill('#audit-phone', '555-1234');
  await page.fill('#audit-city', 'Chicago');

  await page.getByRole('button', { name: /get my free audit/i }).click();

  await expect(page.getByText(/something went wrong/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /get my free audit/i })).toBeEnabled();
});
```

- [ ] **Step 2: Run new tests to confirm they fail**

```
npx playwright test tests/audit-form.spec.ts --reporter=list
```

Expected: the 2 new submit tests FAIL. All other tests PASS.

- [ ] **Step 3: Replace `src/components/auditForm.ts` with the submit handler added**

This is the complete final version of the file. It extends the Task 4 version by importing config/types and adding the `submit` event handler. Replace the entire file:

```typescript
import { AUDIT_API_URL } from '../config';
import { AuditFormData } from '../types/content';

type ValidatorFn = (value: string) => string;

const validators: Record<string, ValidatorFn> = {
  fullName: (v) => (v.trim().length >= 2 ? '' : 'Please enter your full name.'),
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ''
      : 'Please enter a valid email address.',
  businessName: (v) => (v.trim().length > 0 ? '' : 'Please enter your business name.'),
  businessType: (v) => (v !== '' ? '' : 'Please select a business type.'),
  phone: (v) =>
    /^[0-9\s\-()+]{7,}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.',
  city: (v) => (v.trim().length > 0 ? '' : 'Please enter your city or location.'),
};

interface FieldDescriptor {
  name: string;
  inputId: string;
  errorId: string;
}

const REQUIRED_FIELDS: FieldDescriptor[] = [
  { name: 'fullName', inputId: 'audit-full-name', errorId: 'audit-full-name-error' },
  { name: 'email', inputId: 'audit-email', errorId: 'audit-email-error' },
  { name: 'businessName', inputId: 'audit-business-name', errorId: 'audit-business-name-error' },
  { name: 'businessType', inputId: 'audit-business-type', errorId: 'audit-business-type-error' },
  { name: 'phone', inputId: 'audit-phone', errorId: 'audit-phone-error' },
  { name: 'city', inputId: 'audit-city', errorId: 'audit-city-error' },
];

export function createAuditForm(onClose: () => void): HTMLElement {
  const form = document.createElement('form');
  form.className = 'audit-form';
  form.noValidate = true;

  form.innerHTML = `
    <fieldset class="audit-form__fieldset">
      <div class="audit-form__required">
        <div class="form-field">
          <label for="audit-full-name">Full Name</label>
          <input id="audit-full-name" name="fullName" type="text" autocomplete="name" required />
          <p class="form-field__error" id="audit-full-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-email">Email</label>
          <input id="audit-email" name="email" type="email" autocomplete="email" required />
          <p class="form-field__error" id="audit-email-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-name">Business Name</label>
          <input id="audit-business-name" name="businessName" type="text" autocomplete="organization" required />
          <p class="form-field__error" id="audit-business-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-type">Business Type</label>
          <select id="audit-business-type" name="businessType" required>
            <option value="">Select one</option>
            <option value="Salon">Salon</option>
            <option value="Barber Shop">Barber Shop</option>
            <option value="Other">Other</option>
          </select>
          <p class="form-field__error" id="audit-business-type-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-phone">Phone</label>
          <input id="audit-phone" name="phone" type="tel" autocomplete="tel" required />
          <p class="form-field__error" id="audit-phone-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-city">City / Location</label>
          <input id="audit-city" name="city" type="text" autocomplete="address-level2" required />
          <p class="form-field__error" id="audit-city-error" aria-live="polite"></p>
        </div>
      </div>
      <div class="audit-form__optional">
        <button
          type="button"
          class="audit-form__optional-toggle"
          aria-expanded="false"
          aria-controls="audit-optional-fields"
        >
          <span>Tell us more about your business</span>
          <svg class="audit-form__chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div id="audit-optional-fields" class="audit-form__optional-fields" hidden>
          <div class="form-field">
            <label for="audit-pain-points">
              What's your biggest pain point right now?
              <span class="form-field__optional">(optional)</span>
            </label>
            <textarea id="audit-pain-points" name="painPoints" rows="3"></textarea>
          </div>
          <div class="form-field">
            <label for="audit-team-size">
              Team size <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-team-size" name="teamSize">
              <option value="">Select one</option>
              <option value="Just me">Just me</option>
              <option value="2\u20135">2\u20135</option>
              <option value="6\u201310">6\u201310</option>
              <option value="10+">10+</option>
            </select>
          </div>
          <div class="form-field">
            <label for="audit-referral">
              How did you hear about us?
              <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-referral" name="referralSource">
              <option value="">Select one</option>
              <option value="Google">Google</option>
              <option value="Referral">Referral</option>
              <option value="Social media">Social media</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </fieldset>
    <div class="audit-form__footer">
      <p class="audit-form__submit-error" aria-live="polite" hidden></p>
      <button type="submit" class="button button--primary audit-form__submit" disabled>
        Get my free audit
      </button>
    </div>
  `;

  const fieldset = form.querySelector<HTMLFieldSetElement>('.audit-form__fieldset')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('.audit-form__submit')!;
  const submitError = form.querySelector<HTMLParagraphElement>('.audit-form__submit-error')!;
  const optionalToggle = form.querySelector<HTMLButtonElement>('.audit-form__optional-toggle')!;
  const optionalFields = form.querySelector<HTMLElement>('#audit-optional-fields')!;

  optionalToggle.addEventListener('click', () => {
    const expanded = optionalToggle.getAttribute('aria-expanded') === 'true';
    optionalToggle.setAttribute('aria-expanded', String(!expanded));
    optionalFields.hidden = expanded;
  });

  const getInput = (id: string) =>
    form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`#${id}`);

  const validateField = (descriptor: FieldDescriptor): boolean => {
    const field = getInput(descriptor.inputId);
    const errorEl = form.querySelector<HTMLElement>(`#${descriptor.errorId}`);
    if (!field || !errorEl) return true;
    const validate = validators[descriptor.name];
    if (!validate) return true;
    const error = validate(field.value);
    errorEl.textContent = error;
    return error === '';
  };

  const updateSubmitState = () => {
    const allValid = REQUIRED_FIELDS.every((d) => {
      const field = getInput(d.inputId);
      const validate = validators[d.name];
      return field && validate && validate(field.value) === '';
    });
    submitBtn.disabled = !allValid;
  };

  REQUIRED_FIELDS.forEach((descriptor) => {
    const field = getInput(descriptor.inputId);
    if (!field) return;
    field.addEventListener('blur', () => {
      validateField(descriptor);
      updateSubmitState();
    });
    field.addEventListener('input', updateSubmitState);
    field.addEventListener('change', updateSubmitState);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const allValid = REQUIRED_FIELDS.every((d) => validateField(d));
    if (!allValid) {
      updateSubmitState();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending\u2026';
    fieldset.disabled = true;
    submitError.hidden = true;

    const data: AuditFormData = {
      fullName: (getInput('audit-full-name') as HTMLInputElement).value.trim(),
      email: (getInput('audit-email') as HTMLInputElement).value.trim(),
      businessName: (getInput('audit-business-name') as HTMLInputElement).value.trim(),
      businessType: (getInput('audit-business-type') as HTMLSelectElement)
        .value as AuditFormData['businessType'],
      phone: (getInput('audit-phone') as HTMLInputElement).value.trim(),
      city: (getInput('audit-city') as HTMLInputElement).value.trim(),
    };

    const painPoints = (getInput('audit-pain-points') as HTMLTextAreaElement).value.trim();
    const teamSize = (getInput('audit-team-size') as HTMLSelectElement).value;
    const referralSource = (getInput('audit-referral') as HTMLSelectElement).value;

    if (painPoints) data.painPoints = painPoints;
    if (teamSize) data.teamSize = teamSize as AuditFormData['teamSize'];
    if (referralSource) data.referralSource = referralSource as AuditFormData['referralSource'];

    try {
      const resp = await fetch(AUDIT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      form.innerHTML = `
        <div class="audit-form__success" role="status">
          <h3 class="audit-form__success-title">You\u2019re all set</h3>
          <p class="audit-form__success-body">We\u2019ll review your business and be in touch within 24 hours.</p>
          <button type="button" class="button button--primary audit-form__success-close">Done</button>
        </div>
      `;
      form
        .querySelector<HTMLButtonElement>('.audit-form__success-close')
        ?.addEventListener('click', onClose);
    } catch {
      submitError.hidden = false;
      submitError.textContent = 'Something went wrong \u2014 please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get my free audit';
      fieldset.disabled = false;
    }
  });

  return form;
}
```

- [ ] **Step 4: Run all tests**

```
npx playwright test --reporter=list
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/auditForm.ts tests/audit-form.spec.ts
git commit -m "feat: add audit form submit handler with success and error states"
```

---

## Task 6: Modal and form styles

**Files:**
- Modify: `src/styles/modal.css`

No new tests — this is visual polish. Run the full suite after to confirm nothing was broken.

- [ ] **Step 1: Replace `src/styles/modal.css` with the full styles**

```css
/* ─── Modal overlay ─────────────────────────────── */

.modal-overlay[hidden] {
  display: none;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

/* ─── Modal card ─────────────────────────────────── */

.modal-card {
  background: var(--color-parchment);
  border-radius: 4px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
}

.modal-header {
  margin-bottom: 1.5rem;
  padding-right: 2rem;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-ink);
  margin: 0 0 0.375rem;
  font-weight: 600;
}

.modal-subline {
  color: var(--color-muted);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

.modal-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.375rem;
  color: var(--color-muted);
  line-height: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
}

.modal-close:hover {
  color: var(--color-ink);
}

.modal-close:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 82%, white);
  outline-offset: 2px;
}

/* ─── Form layout ────────────────────────────────── */

.audit-form__fieldset {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.audit-form__required {
  display: grid;
  gap: 1rem;
}

/* ─── Field rows ─────────────────────────────────── */

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink);
  line-height: 1.4;
}

.form-field input,
.form-field select,
.form-field textarea {
  border: 1px solid var(--color-paper-strong);
  border-radius: 2px;
  padding: 0.625rem 0.75rem;
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--color-text);
  background: white;
  width: 100%;
  appearance: none;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 82%, white);
  outline-offset: 0;
  border-color: transparent;
}

.form-field textarea {
  resize: vertical;
  min-height: 72px;
}

.form-field__error {
  font-size: 0.8125rem;
  color: var(--color-error);
  margin: 0;
  min-height: 1.1em;
  line-height: 1.4;
}

.form-field__optional {
  color: var(--color-muted);
  font-weight: 400;
  font-size: 0.8125rem;
}

/* ─── Optional section ───────────────────────────── */

.audit-form__optional {
  margin-top: 1.25rem;
  border-top: 1px solid var(--color-paper-strong);
  padding-top: 1.25rem;
}

.audit-form__optional-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  padding: 0;
  font-weight: 500;
}

.audit-form__optional-toggle:hover {
  color: var(--color-ink);
}

.audit-form__optional-toggle:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 82%, white);
  outline-offset: 2px;
  border-radius: 2px;
}

.audit-form__chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.audit-form__optional-toggle[aria-expanded='true'] .audit-form__chevron {
  transform: rotate(180deg);
}

.audit-form__optional-fields {
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
}

/* ─── Footer ─────────────────────────────────────── */

.audit-form__footer {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.audit-form__submit-error {
  font-size: 0.875rem;
  color: var(--color-error);
  margin: 0;
}

/* ─── Success state ──────────────────────────────── */

.audit-form__success {
  text-align: center;
  padding: 1.5rem 0;
}

.audit-form__success-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-ink);
  margin: 0 0 0.75rem;
  font-weight: 600;
}

.audit-form__success-body {
  color: var(--color-muted);
  margin: 0 0 1.5rem;
  line-height: 1.6;
}
```

- [ ] **Step 2: Run all tests to confirm styles didn't break anything**

```
npx playwright test --reporter=list
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/styles/modal.css
git commit -m "feat: add modal and form styles"
```
