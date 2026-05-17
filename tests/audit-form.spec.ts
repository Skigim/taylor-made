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

test('audit modal restores focus to the triggering CTA and unlocks body scroll on close', async ({ page }) => {
  await page.goto('/');

  const trigger = page.getByRole('button', { name: /get a free systems audit/i }).first();

  await trigger.click();

  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe('hidden');

  await page.getByRole('button', { name: /close/i }).click();

  await expect(trigger).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe('');
});

test('audit modal traps focus within visible controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();

  const closeButton = page.getByRole('button', { name: /close/i });
  const optionalToggle = page.getByRole('button', { name: /tell us more about your business/i });

  await expect(closeButton).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(optionalToggle).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(closeButton).toBeFocused();
});

test('audit form resets when the modal is reopened', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await page.fill('#audit-full-name', 'Jane Smith');
  await page.getByRole('button', { name: /close/i }).click();
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();
  await expect(page.locator('#audit-full-name')).toHaveValue('');
});

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

  await expect(submitBtn).toBeDisabled();

  await page.locator('#audit-full-name').blur();
  await page.locator('#audit-email').blur();
  await page.locator('#audit-business-name').blur();
  await page.locator('#audit-business-type').blur();
  await page.locator('#audit-phone').blur();
  await page.locator('#audit-city').blur();

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

test('audit form shows success state after a successful submit', async ({ page }) => {
  let requestBody: Record<string, unknown> | null = null;
  let contentType = '';

  await page.route('/api/audit', (route) =>
    {
      requestBody = route.request().postDataJSON() as Record<string, unknown>;
      contentType = route.request().headers()['content-type'] ?? '';

      return route.fulfill({ status: 200, body: '{}', contentType: 'application/json' });
    }
  );
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();

  await page.fill('#audit-full-name', 'Jane Smith');
  await page.locator('#audit-full-name').blur();
  await page.fill('#audit-email', 'jane@example.com');
  await page.locator('#audit-email').blur();
  await page.fill('#audit-business-name', 'Smith Salon');
  await page.locator('#audit-business-name').blur();
  await page.selectOption('#audit-business-type', 'Salon');
  await page.locator('#audit-business-type').blur();
  await page.fill('#audit-phone', '555-1234');
  await page.locator('#audit-phone').blur();
  await page.fill('#audit-city', 'Chicago');
  await page.locator('#audit-city').blur();

  await page.getByRole('button', { name: /get my free audit/i }).click();

  await expect(page.getByRole('heading', { name: /you're all set/i })).toBeVisible();
  await expect(page.getByText(/we[’']ll review your business and be in touch within 24 hours/i)).toBeVisible();

  expect(contentType).toBe('application/json');
  expect(requestBody).toEqual({
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    businessName: 'Smith Salon',
    businessType: 'Salon',
    phone: '555-1234',
    city: 'Chicago',
  });
});

test('audit form shows error message and re-enables when submit fails', async ({ page }) => {
  await page.route('/api/audit', (route) =>
    route.fulfill({ status: 500, body: '{}', contentType: 'application/json' })
  );
  await page.goto('/');
  await page.getByRole('button', { name: /get a free systems audit/i }).first().click();

  await page.fill('#audit-full-name', 'Jane Smith');
  await page.locator('#audit-full-name').blur();
  await page.fill('#audit-email', 'jane@example.com');
  await page.locator('#audit-email').blur();
  await page.fill('#audit-business-name', 'Smith Salon');
  await page.locator('#audit-business-name').blur();
  await page.selectOption('#audit-business-type', 'Salon');
  await page.locator('#audit-business-type').blur();
  await page.fill('#audit-phone', '555-1234');
  await page.locator('#audit-phone').blur();
  await page.fill('#audit-city', 'Chicago');
  await page.locator('#audit-city').blur();

  await page.getByRole('button', { name: /get my free audit/i }).click();

  await expect(page.getByText(/something went wrong/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /get my free audit/i })).toBeEnabled();
});