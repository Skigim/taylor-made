import { expect, test } from '@playwright/test';

import { isRemoteGoogleFontRequest } from '../src/lib/html';

test('homepage uses bundled hero fonts without remote requests', async ({ page }) => {
  const remoteFontRequests: string[] = [];

  page.on('request', (request) => {
    if (isRemoteGoogleFontRequest(request.url())) {
      remoteFontRequests.push(request.url());
    }
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /modern infrastructure for service businesses that deserve better systems/i,
    })
  ).toBeVisible();

  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);

  expect(remoteFontRequests).toEqual([]);
});

test('homepage shows the approved hero content', async ({ page }) => {
  await page.goto('/');

  const heroSection = page.locator('section.hero');
  const auditOverview = page.getByRole('complementary', { name: /audit overview/i });
  const monogram = auditOverview.locator('.hero__mark');

  await expect(page.getByText('TaylorMade LLC')).toBeVisible();
  await expect(page.getByText('Appointment-based focus')).toBeVisible();

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

  const primaryCta = heroSection.getByRole('button', { name: /get a free systems audit/i });
  await expect(primaryCta).toBeVisible();
  await expect(auditOverview.getByRole('img')).toHaveCount(0);
  await expect(monogram).toBeVisible();
  await expect
    .poll(() => monogram.evaluate((img) => (img as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
});

test('homepage explains the audit scope and service capabilities', async ({ page }) => {
  await page.goto('/');

  const auditOverview = page.getByRole('complementary', { name: /audit overview/i });
  const capabilitiesSection = page.locator('section[aria-labelledby="capabilities-title"]');

  await expect(auditOverview.getByRole('heading', { name: /what the review covers/i })).toHaveCount(0);
  await expect(page.locator('main > section[aria-labelledby="audit-scope-title"]')).toHaveCount(0);

  await expect(auditOverview.getByText(/the problem/i)).toBeVisible();
  await expect(
    auditOverview.getByRole('heading', {
      name: /most local shops are running real businesses on a stack of disconnected fixes/i,
    })
  ).toBeVisible();

  await expect(page.locator('main > section[aria-labelledby="problem-title"]')).toHaveCount(0);

  await expect(capabilitiesSection.getByText(/online presence/i)).toBeVisible();
  await expect(capabilitiesSection.getByText(/scheduling flow/i)).toBeVisible();
  await expect(capabilitiesSection.getByText(/payments and operations/i)).toBeVisible();

  await expect(page.getByText(/^presence$/i)).toBeVisible();
  await expect(page.getByText(/^operations$/i)).toBeVisible();
  await expect(page.getByText(/^retention$/i)).toBeVisible();
});

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

test('homepage shows the process section with numbered steps', async ({ page }) => {
  await page.goto('/');

  const processSection = page.locator('section[aria-labelledby="process-title"]');

  await expect(
    processSection.getByRole('heading', { name: /how it works/i })
  ).toBeVisible();

  await expect(processSection.locator('.process-step')).toHaveCount(3);
  await expect(processSection.locator('.process-step__title')).toHaveText([
    'Audit',
    'Prioritize',
    'Build',
  ]);
  await expect(processSection.getByRole('heading', { name: /^support$/i })).toHaveCount(0);
});

test('homepage shows a closing CTA section', async ({ page }) => {
  await page.goto('/');

  const ctaSection = page.locator('section[aria-labelledby="closing-cta-title"]');
  const modal = page.locator('#audit-modal');

  await expect(
    ctaSection.getByRole('heading', { name: /^get a free systems audit$/i })
  ).toBeVisible();

  await expect(
    ctaSection.getByText(
      /a free business systems audit for salons and barbers who are tired of piecing together websites, booking tools, payments, and follow-up by hand/i
    )
  ).toBeVisible();

  const closingCtaButton = ctaSection.getByRole('button', {
    name: /^get a free systems audit$/i,
  });
  await expect(closingCtaButton).toBeVisible();

  await closingCtaButton.click();
  await expect(modal).toBeVisible();
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