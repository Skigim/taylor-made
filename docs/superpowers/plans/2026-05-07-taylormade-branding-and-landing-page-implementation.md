# TaylorMade Branding and Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready first landing page for TaylorMade LLC in TypeScript, expressing the approved brand system and converting salon and barber owners into free business systems audit inquiries.

**Architecture:** Use a small Vite-based static site with TypeScript so the page stays simple to ship while giving the content model, render logic, and future site expansion a typed foundation. Keep content, types, layout logic, and styling in focused files so visual refinement remains easy during implementation.

**Tech Stack:** Vite, TypeScript, HTML, CSS, Playwright

---

## File Structure

### Planned Files

- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `playwright.config.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Create: `src/types/content.ts`
- Create: `src/content/siteContent.ts`
- Create: `src/assets/tm-monogram.svg`
- Create: `tests/landing-page.spec.ts`

### Responsibilities

- `package.json`: development scripts and frontend test dependencies
- `.gitignore`: ignore dependencies, build output, test artifacts, and persisted brainstorming files
- `tsconfig.json`: TypeScript compiler settings for the Vite app
- `index.html`: semantic page shell and root mount point
- `playwright.config.ts`: browser test configuration and local dev server wiring
- `src/main.ts`: page assembly from typed content data
- `src/styles.css`: brand tokens, layout system, responsiveness, and visual polish
- `src/types/content.ts`: shared TypeScript interfaces for the landing page content model
- `src/content/siteContent.ts`: typed copy and structured page content
- `src/assets/tm-monogram.svg`: provisional branded mark for compact identity use
- `tests/landing-page.spec.ts`: browser-level smoke tests for the main content and CTA flow

### Task 1: Scaffold the TypeScript Site and Browser Test Harness

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `playwright.config.ts`
- Test: `tests/landing-page.spec.ts`

- [ ] **Step 1: Write the failing browser smoke test**

```ts
import { test, expect } from '@playwright/test';

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm install && npx playwright test tests/landing-page.spec.ts`

Expected: FAIL because the project files and homepage do not exist yet.

- [ ] **Step 3: Add the minimal TypeScript scaffold**

`package.json`

```json
{
  "name": "taylormade-landing-page",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0",
    "typescript": "^5.8.3",
    "vite": "^7.0.0"
  }
}
```

`.gitignore`

```gitignore
node_modules/
dist/
.superpowers/
playwright-report/
test-results/
```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "tests", "playwright.config.ts"]
}
```

`index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TaylorMade LLC</title>
    <meta
      name="description"
      content="Modern infrastructure for salons, barbers, and appointment-based businesses."
    />
    <script type="module" src="/src/main.ts"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

`playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

- [ ] **Step 4: Run the test again to verify the scaffold still fails for the right reason**

Run: `npm install && npx playwright test tests/landing-page.spec.ts`

Expected: FAIL because the homepage application code still does not exist.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore tsconfig.json index.html playwright.config.ts tests/landing-page.spec.ts
git commit -m "chore: scaffold Taylormade TypeScript landing page"
```

### Task 2: Add Typed Content Models and the Hero Section

**Files:**
- Create: `src/types/content.ts`
- Create: `src/content/siteContent.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Test: `tests/landing-page.spec.ts`

- [ ] **Step 1: Expand the failing test for the approved hero content**

Update `tests/landing-page.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/landing-page.spec.ts`

Expected: FAIL because the typed content files and render logic do not exist.

- [ ] **Step 3: Define the TypeScript content model**

`src/types/content.ts`

```ts
export interface HeroContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryNote: string;
}

export interface BrandContent {
  name: string;
  audience: string;
}

export interface LandingPageContent {
  brand: BrandContent;
  hero: HeroContent;
}
```

`src/content/siteContent.ts`

```ts
import type { LandingPageContent } from '../types/content';

export const siteContent: LandingPageContent = {
  brand: {
    name: 'TaylorMade LLC',
    audience: 'Salon and barber focus',
  },
  hero: {
    title: 'Modern infrastructure for service businesses that deserve better systems.',
    description:
      'Web presence, online booking, billing, reminders, and customer flow designed around how your shop actually runs.',
    primaryCta: 'Get a free systems audit',
    secondaryNote: 'For appointment-based local businesses',
  },
};
```

- [ ] **Step 4: Render the hero shell from typed content**

`src/main.ts`

```ts
import './styles.css';
import { siteContent } from './content/siteContent';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root element');
}

app.innerHTML = `
  <main class="page-shell">
    <section class="hero">
      <div class="hero__content">
        <p class="eyebrow">${siteContent.brand.name}</p>
        <h1>${siteContent.hero.title}</h1>
        <p class="hero__description">${siteContent.hero.description}</p>
        <div class="hero__actions">
          <button type="button" class="button button--primary">${siteContent.hero.primaryCta}</button>
          <span class="hero__note">${siteContent.hero.secondaryNote}</span>
        </div>
      </div>
      <aside class="hero__panel" aria-label="Audit overview">
        <p class="eyebrow">${siteContent.brand.audience}</p>
        <p class="hero__panel-copy">
          The audit identifies what is working, what is costing time, and what to fix first.
        </p>
      </aside>
    </section>
  </main>
`;
```

`src/styles.css`

```css
:root {
  --color-ink: #15202a;
  --color-ink-soft: #274150;
  --color-paper: #f5efe3;
  --color-paper-strong: #eadfca;
  --color-text: #162028;
  --color-muted: #5f6d74;
  --color-accent: #d4af37;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Manrope', 'Montserrat', sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-paper);
}

.page-shell {
  min-height: 100vh;
}

.hero {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  min-height: 100vh;
}

.hero__content {
  padding: 4rem 3rem;
  color: #f8f3ea;
  background: linear-gradient(160deg, var(--color-ink) 0%, var(--color-ink-soft) 100%);
}

.hero__panel {
  padding: 3rem;
  background: var(--color-paper-strong);
}

.eyebrow {
  margin: 0 0 1rem;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.75rem;
}

h1 {
  margin: 0;
  max-width: 11ch;
  font-family: var(--font-display);
  font-size: clamp(3rem, 7vw, 5rem);
  line-height: 0.96;
}

.hero__description,
.hero__panel-copy,
.hero__note {
  font-size: 1rem;
  line-height: 1.7;
}

.hero__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 2rem;
}

.button {
  font: inherit;
}

.button--primary {
  border: 0;
  padding: 1rem 1.5rem;
  color: var(--color-ink);
  background: var(--color-accent);
  font-weight: 700;
}
```

- [ ] **Step 5: Run the test to verify the hero passes**

Run: `npx playwright test tests/landing-page.spec.ts`

Expected: PASS for the approved hero content and primary CTA.

- [ ] **Step 6: Commit**

```bash
git add src/types/content.ts src/content/siteContent.ts src/main.ts src/styles.css tests/landing-page.spec.ts
git commit -m "feat: add Taylormade typed hero section"
```

### Task 3: Add Typed Audit Scope, Problem Framing, and Capability Sections

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/content/siteContent.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Test: `tests/landing-page.spec.ts`

- [ ] **Step 1: Extend the failing test for the middle page narrative**

Append to `tests/landing-page.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/landing-page.spec.ts`

Expected: FAIL because the audit scope, problem section, and capability cards are not rendered yet.

- [ ] **Step 3: Extend the shared types and page content**

Update `src/types/content.ts`:

```ts
export interface HeroContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryNote: string;
}

export interface BrandContent {
  name: string;
  audience: string;
}

export interface Capability {
  name: string;
  description: string;
}

export interface ProblemContent {
  title: string;
  points: string[];
}

export interface LandingPageContent {
  brand: BrandContent;
  hero: HeroContent;
  auditScope: string[];
  problem: ProblemContent;
  capabilities: Capability[];
}
```

Update `src/content/siteContent.ts`:

```ts
import type { LandingPageContent } from '../types/content';

export const siteContent: LandingPageContent = {
  brand: {
    name: 'TaylorMade LLC',
    audience: 'Salon and barber focus',
  },
  hero: {
    title: 'Modern infrastructure for service businesses that deserve better systems.',
    description:
      'Web presence, online booking, billing, reminders, and customer flow designed around how your shop actually runs.',
    primaryCta: 'Get a free systems audit',
    secondaryNote: 'For appointment-based local businesses',
  },
  auditScope: ['Online presence', 'Scheduling flow', 'Payments and operations'],
  problem: {
    title: 'Most local shops are running real businesses on a stack of disconnected fixes.',
    points: [
      'Missed calls become missed bookings.',
      'Clients face inconsistent websites and booking tools.',
      'Reminders, intake, billing, and follow-up stay manual.',
    ],
  },
  capabilities: [
    {
      name: 'Presence',
      description: 'Sites, listings, messaging, and visual trust signals.',
    },
    {
      name: 'Operations',
      description: 'Scheduling, reminders, intake, billing, and workflow cleanup.',
    },
    {
      name: 'Retention',
      description: 'Rebooking prompts, follow-up systems, and customer touchpoints.',
    },
  ],
};
```

- [ ] **Step 4: Render the middle sections from typed arrays**

Update `src/main.ts`:

```ts
import './styles.css';
import { siteContent } from './content/siteContent';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root element');
}

const scopeItems = siteContent.auditScope
  .map((item) => `<li class="scope-list__item">${item}</li>`)
  .join('');

const problemItems = siteContent.problem.points
  .map(
    (point, index) => `
      <li class="problem-list__item">
        <span>${point}</span>
        <span class="problem-list__index">0${index + 1}</span>
      </li>
    `
  )
  .join('');

const capabilityItems = siteContent.capabilities
  .map(
    ({ name, description }, index) => `
      <article class="capability-card">
        <p class="eyebrow capability-card__index">0${index + 1}</p>
        <h3>${name}</h3>
        <p>${description}</p>
      </article>
    `
  )
  .join('');

app.innerHTML = `
  <main class="page-shell">
    <section class="hero">
      <div class="hero__content">
        <p class="eyebrow">${siteContent.brand.name}</p>
        <h1>${siteContent.hero.title}</h1>
        <p class="hero__description">${siteContent.hero.description}</p>
        <div class="hero__actions">
          <button type="button" class="button button--primary">${siteContent.hero.primaryCta}</button>
          <span class="hero__note">${siteContent.hero.secondaryNote}</span>
        </div>
      </div>
      <aside class="hero__panel" aria-label="Audit overview">
        <p class="eyebrow">${siteContent.brand.audience}</p>
        <p class="hero__panel-copy">
          The audit identifies what is working, what is costing time, and what to fix first.
        </p>
      </aside>
    </section>

    <section class="section section--paper">
      <div class="section__intro">
        <p class="eyebrow">Audit scope</p>
        <h2>What the review covers</h2>
      </div>
      <ul class="scope-list">${scopeItems}</ul>
    </section>

    <section class="section section--split">
      <div>
        <p class="eyebrow">The problem</p>
        <h2>${siteContent.problem.title}</h2>
      </div>
      <ol class="problem-list">${problemItems}</ol>
    </section>

    <section class="section section--paper">
      <div class="section__intro">
        <p class="eyebrow">Capabilities</p>
        <h2>What TaylorMade builds and improves</h2>
      </div>
      <div class="capability-grid">${capabilityItems}</div>
    </section>
  </main>
`;
```

- [ ] **Step 5: Add the supporting layout styles**

Append to `src/styles.css`:

```css
.section {
  padding: 2.5rem 3rem;
}

.section--paper {
  background: #f8f3ea;
}

.section--split {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 2rem;
  background: var(--color-paper);
  border-block: 1px solid rgba(22, 32, 40, 0.08);
}

.section__intro {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: end;
}

h2,
.capability-card h3 {
  margin: 0;
  font-family: var(--font-display);
}

.scope-list,
.problem-list {
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.scope-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.scope-list__item,
.capability-card {
  padding: 1.25rem;
  border: 1px solid rgba(22, 32, 40, 0.1);
  background: rgba(255, 255, 255, 0.45);
}

.problem-list__item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(22, 32, 40, 0.1);
}

.problem-list__index,
.capability-card__index {
  color: var(--color-accent);
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}
```

- [ ] **Step 6: Run the test to verify the middle narrative passes**

Run: `npx playwright test tests/landing-page.spec.ts`

Expected: PASS for the audit scope, problem framing, and capabilities content.

- [ ] **Step 7: Commit**

```bash
git add src/types/content.ts src/content/siteContent.ts src/main.ts src/styles.css tests/landing-page.spec.ts
git commit -m "feat: add Taylormade typed service narrative sections"
```

### Task 4: Add the Process Section, Closing CTA, and Provisional Monogram

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/content/siteContent.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Create: `src/assets/tm-monogram.svg`
- Test: `tests/landing-page.spec.ts`

- [ ] **Step 1: Expand the failing test for the process and final CTA**

Append to `tests/landing-page.spec.ts`:

```ts
test('homepage closes with a clear process and repeated audit call to action', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(/^audit$/i)).toBeVisible();
  await expect(page.getByText(/^prioritize$/i)).toBeVisible();
  await expect(page.getByText(/^build$/i)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /get a free business systems audit/i })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /request your audit/i })
  ).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/landing-page.spec.ts`

Expected: FAIL because the process section, closing CTA, and final button are not rendered yet.

- [ ] **Step 3: Extend the types and content model for the final sections**

Update `src/types/content.ts`:

```ts
export interface HeroContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryNote: string;
}

export interface BrandContent {
  name: string;
  audience: string;
}

export interface Capability {
  name: string;
  description: string;
}

export interface ProblemContent {
  title: string;
  points: string[];
}

export interface ProcessStep {
  name: string;
  description: string;
}

export interface ClosingCtaContent {
  title: string;
  description: string;
  buttonLabel: string;
}

export interface LandingPageContent {
  brand: BrandContent;
  hero: HeroContent;
  auditScope: string[];
  problem: ProblemContent;
  capabilities: Capability[];
  process: ProcessStep[];
  closingCta: ClosingCtaContent;
}
```

Update `src/content/siteContent.ts`:

```ts
import type { LandingPageContent } from '../types/content';

export const siteContent: LandingPageContent = {
  brand: {
    name: 'TaylorMade LLC',
    audience: 'Salon and barber focus',
  },
  hero: {
    title: 'Modern infrastructure for service businesses that deserve better systems.',
    description:
      'Web presence, online booking, billing, reminders, and customer flow designed around how your shop actually runs.',
    primaryCta: 'Get a free systems audit',
    secondaryNote: 'For appointment-based local businesses',
  },
  auditScope: ['Online presence', 'Scheduling flow', 'Payments and operations'],
  problem: {
    title: 'Most local shops are running real businesses on a stack of disconnected fixes.',
    points: [
      'Missed calls become missed bookings.',
      'Clients face inconsistent websites and booking tools.',
      'Reminders, intake, billing, and follow-up stay manual.',
    ],
  },
  capabilities: [
    {
      name: 'Presence',
      description: 'Sites, listings, messaging, and visual trust signals.',
    },
    {
      name: 'Operations',
      description: 'Scheduling, reminders, intake, billing, and workflow cleanup.',
    },
    {
      name: 'Retention',
      description: 'Rebooking prompts, follow-up systems, and customer touchpoints.',
    },
  ],
  process: [
    {
      name: 'Audit',
      description: 'We review the tools, flow, and friction points you already have.',
    },
    {
      name: 'Prioritize',
      description: 'You get a clear order of improvements instead of vague recommendations.',
    },
    {
      name: 'Build',
      description: 'TaylorMade implements the right-fit infrastructure with you.',
    },
  ],
  closingCta: {
    title: 'Get a free business systems audit.',
    description:
      'If your shop feels harder to run than it should, the issue is usually the setup. Start with a practical review.',
    buttonLabel: 'Request your audit',
  },
};
```

Create `src/assets/tm-monogram.svg`:

```svg
<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="94" height="94" rx="8" stroke="#D4AF37" stroke-width="2"/>
  <path d="M22 27H74" stroke="#D4AF37" stroke-width="4"/>
  <path d="M48 27V69" stroke="#F5EFE3" stroke-width="4"/>
  <path d="M30 69V46H22" stroke="#F5EFE3" stroke-width="4"/>
  <path d="M66 69V46L57 56L48 46L39 56L30 46V69" stroke="#F5EFE3" stroke-width="4"/>
</svg>
```

- [ ] **Step 4: Render the process grid and closing CTA band**

Update `src/main.ts`:

```ts
import './styles.css';
import markUrl from './assets/tm-monogram.svg';
import { siteContent } from './content/siteContent';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root element');
}

const scopeItems = siteContent.auditScope
  .map((item) => `<li class="scope-list__item">${item}</li>`)
  .join('');

const problemItems = siteContent.problem.points
  .map(
    (point, index) => `
      <li class="problem-list__item">
        <span>${point}</span>
        <span class="problem-list__index">0${index + 1}</span>
      </li>
    `
  )
  .join('');

const capabilityItems = siteContent.capabilities
  .map(
    ({ name, description }, index) => `
      <article class="capability-card">
        <p class="eyebrow capability-card__index">0${index + 1}</p>
        <h3>${name}</h3>
        <p>${description}</p>
      </article>
    `
  )
  .join('');

const processItems = siteContent.process
  .map(
    ({ name, description }, index) => `
      <article class="process-card">
        <p class="eyebrow">Step 0${index + 1}</p>
        <h3>${name}</h3>
        <p>${description}</p>
      </article>
    `
  )
  .join('');

app.innerHTML = `
  <main class="page-shell">
    <section class="hero">
      <div class="hero__content">
        <p class="eyebrow">${siteContent.brand.name}</p>
        <h1>${siteContent.hero.title}</h1>
        <p class="hero__description">${siteContent.hero.description}</p>
        <div class="hero__actions">
          <button type="button" class="button button--primary">${siteContent.hero.primaryCta}</button>
          <span class="hero__note">${siteContent.hero.secondaryNote}</span>
        </div>
      </div>
      <aside class="hero__panel" aria-label="Audit overview">
        <img class="hero__mark" src="${markUrl}" alt="TaylorMade monogram" />
        <p class="eyebrow">${siteContent.brand.audience}</p>
        <p class="hero__panel-copy">
          The audit identifies what is working, what is costing time, and what to fix first.
        </p>
      </aside>
    </section>

    <section class="section section--paper">
      <div class="section__intro">
        <p class="eyebrow">Audit scope</p>
        <h2>What the review covers</h2>
      </div>
      <ul class="scope-list">${scopeItems}</ul>
    </section>

    <section class="section section--split">
      <div>
        <p class="eyebrow">The problem</p>
        <h2>${siteContent.problem.title}</h2>
      </div>
      <ol class="problem-list">${problemItems}</ol>
    </section>

    <section class="section section--paper">
      <div class="section__intro">
        <p class="eyebrow">Capabilities</p>
        <h2>What TaylorMade builds and improves</h2>
      </div>
      <div class="capability-grid">${capabilityItems}</div>
    </section>

    <section class="section section--process">
      <div class="process-grid">${processItems}</div>
    </section>

    <section class="section section--closing">
      <div>
        <p class="eyebrow">Call to action</p>
        <h2>${siteContent.closingCta.title}</h2>
        <p>${siteContent.closingCta.description}</p>
      </div>
      <button type="button" class="button button--primary">${siteContent.closingCta.buttonLabel}</button>
    </section>
  </main>
`;
```

- [ ] **Step 5: Add the final-section styles**

Append to `src/styles.css`:

```css
.hero__mark {
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: 2rem;
}

.section--process {
  padding-top: 0;
  background: var(--color-paper);
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(22, 32, 40, 0.1);
}

.process-card {
  padding: 1.5rem;
  background: #f8f3ea;
}

.section--closing {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 2rem;
  color: #f4efe5;
  background: var(--color-ink);
}

.section--closing p {
  max-width: 36rem;
  color: #cfd8dc;
}
```

- [ ] **Step 6: Run the test to verify the full page passes**

Run: `npx playwright test tests/landing-page.spec.ts`

Expected: PASS for the process section and closing CTA.

- [ ] **Step 7: Commit**

```bash
git add src/types/content.ts src/content/siteContent.ts src/main.ts src/styles.css src/assets/tm-monogram.svg tests/landing-page.spec.ts
git commit -m "feat: add Taylormade process and closing sections"
```

### Task 5: Responsive Polish and Type-Safe Final Validation

**Files:**
- Modify: `src/styles.css`
- Modify: `tests/landing-page.spec.ts`

- [ ] **Step 1: Add a failing mobile-layout smoke test**

Append to `tests/landing-page.spec.ts`:

```ts
test('homepage remains usable on a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(
    page.getByRole('button', { name: /get a free systems audit/i })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /request your audit/i })
  ).toBeVisible();
  await expect(page.getByText(/^presence$/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the mobile test to verify it fails or exposes layout overlap**

Run: `npx playwright test tests/landing-page.spec.ts --grep "narrow mobile viewport"`

Expected: FAIL or show layout overflow because the desktop grid layouts have not been adapted for small screens.

- [ ] **Step 3: Add the responsive layout rules**

Append to `src/styles.css`:

```css
@media (max-width: 900px) {
  .hero,
  .section--split,
  .section__intro,
  .section--closing {
    grid-template-columns: 1fr;
    display: grid;
  }

  .scope-list,
  .capability-grid,
  .process-grid {
    grid-template-columns: 1fr;
  }

  .hero__content,
  .hero__panel,
  .section {
    padding: 2rem 1.25rem;
  }

  h1 {
    max-width: none;
    font-size: clamp(2.5rem, 12vw, 4rem);
  }

  .hero__actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

- [ ] **Step 4: Run the full validation suite**

Run: `npm run test:e2e && npm run build`

Expected: PASS for all Playwright checks, then TypeScript no-emit validation passes and Vite writes the production build to `dist/`.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css tests/landing-page.spec.ts
git commit -m "feat: polish Taylormade landing page responsiveness"
```

## Self-Review

### Spec Coverage

- Brand positioning: covered by hero tone, audit framing, and service narrative tasks
- Voice and messaging: covered by the typed `siteContent` model and render tasks
- Color, typography, and graphic system: covered by `src/styles.css` tasks
- Logo system direction: covered by the provisional `tm-monogram.svg` asset
- Landing page structure: covered by hero, audit scope, problem, capabilities, process, and closing CTA tasks
- Responsive requirement: covered by Task 5
- TypeScript preference: covered by `tsconfig.json`, `.ts` source files, shared interfaces, and type-checked build validation

### Placeholder Scan

- No `TODO`, `TBD`, or deferred implementation placeholders remain in the steps
- Every code-changing step includes concrete file content or snippets
- Every validation step includes an executable command and expected result

### Type and Naming Consistency

- `LandingPageContent` remains the shared content contract across the implementation tasks
- Section names stay consistent across tests and rendering: `Presence`, `Operations`, `Retention`, `Audit`, `Prioritize`, `Build`
- CTA labels remain consistent between content, UI rendering, and tests
