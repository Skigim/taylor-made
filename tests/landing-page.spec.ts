import { expect, test } from '@playwright/test';

test('homepage shows the approved hero content', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.hero__brand')).toHaveAttribute('aria-label', /taylormade llc/i);

  await expect(
    page.getByRole('heading', {
      name: /modern infrastructure/i,
    })
  ).toBeVisible();

  await expect(page.getByText(/web presence, online booking, billing/i)).toBeVisible();

  await expect(page.getByText(/salon and barber focus/i)).toBeVisible();

  const primaryCta = page.getByRole('link', { name: /get a free systems audit/i });
  await expect(primaryCta).toBeVisible();
  await expect(primaryCta).toHaveAttribute('href', '#audit-overview');
});

test('primary CTA jumps to the audit overview panel', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /get a free systems audit/i }).click();

  await expect(page).toHaveURL(/#audit-overview$/);
  await expect(page.locator('#audit-overview')).toBeVisible();
});

test('homepage collapses the hero to a single column on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 960 });
  await page.goto('/');

  const heroContent = page.locator('.hero__content');
  const heroPanel = page.locator('.hero__panel');
  const contentBox = await heroContent.boundingBox();
  const panelBox = await heroPanel.boundingBox();

  expect(contentBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.y).toBeGreaterThan(contentBox!.y + 1);
});