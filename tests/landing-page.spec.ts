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