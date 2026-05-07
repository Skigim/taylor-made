import { expect, test } from '@playwright/test';

const MAX_DESKTOP_SCROLL_DRIFT = 24;

test('homepage uses bundled hero fonts without remote requests', async ({ page }) => {
  const remoteFontRequests: string[] = [];

  page.on('request', (request) => {
    if (/https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//i.test(request.url())) {
      remoteFontRequests.push(request.url());
    }
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /modern infrastructure for service businesses that deserve better systems/i,
    })
  ).toBeVisible();

  expect(remoteFontRequests).toEqual([]);
});

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
});

test('homepage explains the audit scope and service capabilities', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(/online presence/i)).toBeVisible();
  await expect(page.getByText(/scheduling flow/i)).toBeVisible();
  await expect(page.getByText(/payments and operations/i)).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /most local shops are running real businesses on a stack of disconnected fixes/i,
    })
  ).toBeVisible();

  await expect(page.getByText(/^presence$/i)).toBeVisible();
  await expect(page.getByText(/^operations$/i)).toBeVisible();
  await expect(page.getByText(/^retention$/i)).toBeVisible();
});

test('hero CTA focuses the audit overview without desktop scroll jumps', async ({ page }) => {
  await page.goto('/');

  const primaryCta = page.getByRole('button', { name: /get a free systems audit/i });
  const auditOverview = page.getByRole('complementary', { name: /audit overview/i });
  const auditOverviewHeading = page.getByRole('heading', { name: /audit overview/i });
  const viewportHeight = page.viewportSize()?.height ?? 0;
  const panelBefore = await auditOverview.boundingBox();
  const scrollBefore = await page.evaluate(() => window.scrollY);

  expect(panelBefore).not.toBeNull();

  await primaryCta.click();

  await expect(auditOverviewHeading).toBeFocused();

  if (!panelBefore) {
    throw new Error('Expected audit overview panel bounding box');
  }

  expect(panelBefore.y).toBeLessThan(viewportHeight);
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - scrollBefore))
    .toBeLessThanOrEqual(MAX_DESKTOP_SCROLL_DRIFT);
});

test('hero CTA scrolls the audit overview into view on narrow screens before focusing it', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 540 });
  await page.goto('/');

  const primaryCta = page.getByRole('button', { name: /get a free systems audit/i });
  const auditOverview = page.getByRole('complementary', { name: /audit overview/i });
  const auditOverviewHeading = page.getByRole('heading', { name: /audit overview/i });
  const viewportHeight = page.viewportSize()?.height ?? 0;
  const panelBefore = await auditOverview.boundingBox();

  expect(panelBefore).not.toBeNull();

  if (!panelBefore) {
    throw new Error('Expected audit overview panel bounding box');
  }

  expect(panelBefore.y).toBeGreaterThanOrEqual(viewportHeight);

  await primaryCta.click();

  await expect(auditOverviewHeading).toBeFocused();
  await expect(auditOverview).toBeInViewport();
});

test('homepage shows the process section with numbered steps', async ({ page }) => {
  await page.goto('/');

  const processSection = page.locator('section[aria-labelledby="process-title"]');

  await expect(
    processSection.getByRole('heading', { name: /how it works/i })
  ).toBeVisible();

  await expect(processSection.getByRole('heading', { name: /^audit$/i })).toBeVisible();
  await expect(processSection.getByRole('heading', { name: /^plan$/i })).toBeVisible();
  await expect(processSection.getByRole('heading', { name: /^build$/i })).toBeVisible();
  await expect(processSection.getByRole('heading', { name: /^support$/i })).toBeVisible();
});

test('homepage shows a closing CTA section', async ({ page }) => {
  await page.goto('/');

  const ctaSection = page.locator('section[aria-labelledby="closing-cta-title"]');

  await expect(
    ctaSection.getByRole('heading', { name: /ready to stop patching and start building/i })
  ).toBeVisible();

  await expect(ctaSection.getByText(/the audit is free/i)).toBeVisible();

  const closingCtaButton = ctaSection.getByRole('button', { name: /book your free audit/i });
  await expect(closingCtaButton).toBeVisible();
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