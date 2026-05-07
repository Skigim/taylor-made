import { expect, test } from '@playwright/test';

test('homepage shows the approved hero content', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('TaylorMade LLC')).toBeVisible();
  await expect(page.getByText('Salon and barber focus')).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /modern infrastructure for service businesses that deserve better systems/i,
    })
  ).toBeVisible();

  await expect(
    page.getByText(
      /web presence, online booking, billing, reminders, and customer flow designed around how your shop actually runs/i
    )
  ).toBeVisible();

  await expect(page.getByText(/appointment-based local businesses/i)).toBeVisible();

  const primaryCta = page.getByRole('button', { name: /get a free systems audit/i });
  await expect(primaryCta).toBeVisible();

  await primaryCta.click();
  await expect(page.getByTestId('audit-overview')).toBeFocused();
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

  if (!contentBox || !panelBox) {
    throw new Error('Expected hero content and audit panel bounding boxes');
  }

  expect(panelBox.y).toBeGreaterThan(contentBox.y + 1);
});