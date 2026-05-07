import { expect, test } from '@playwright/test';

test('homepage shows the audit offer and primary CTA', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /modern infrastructure for service businesses that deserve better systems/i,
    })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: /get a free systems audit/i })
  ).toBeVisible();
});