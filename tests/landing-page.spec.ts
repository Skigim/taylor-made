import { expect, test } from '@playwright/test';

test('homepage shows the approved hero content', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(/taylormade llc/i)).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /modern infrastructure for service businesses that deserve better systems/i,
    })
  ).toBeVisible();

  await expect(
    page.getByText(/web presence, online booking, billing, reminders, and customer flow/i)
  ).toBeVisible();

  await expect(page.getByText(/salon and barber focus/i)).toBeVisible();

  await expect(
    page.getByRole('button', { name: /get a free systems audit/i })
  ).toBeVisible();
});