import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import './styles.css';
import { siteContent } from './content/siteContent';

const app = document.querySelector<HTMLDivElement>('#app');
const auditPanelCopy =
  'The audit identifies what is working, what is costing time, and what to fix first.';

if (!app) {
  throw new Error('Missing #app root element');
}

const splitBrandName = (brandName: string) => {
  const normalizedBrandName = brandName.trim();
  const lastSpaceIndex = normalizedBrandName.lastIndexOf(' ');

  if (lastSpaceIndex < 0) {
    return {
      brandWordmark: normalizedBrandName,
      brandSuffix: '',
    };
  }

  return {
    brandWordmark: normalizedBrandName.slice(0, lastSpaceIndex),
    brandSuffix: normalizedBrandName.slice(lastSpaceIndex + 1),
  };
};

const { brandWordmark, brandSuffix } = splitBrandName(siteContent.brand.name);

const scopeItems = siteContent.auditScope
  .map((item) => `<li class="scope-list__item">${item}</li>`)
  .join('');

const problemItems = siteContent.problem.points
  .map(
    (point, index) => `
      <li class="problem-list__item">
        <span>${point}</span>
        <span class="problem-list__index">${String(index + 1).padStart(2, '0')}</span>
      </li>
    `
  )
  .join('');

const capabilityItems = siteContent.capabilities
  .map(
    ({ name, description }, index) => `
      <article class="capability-card">
        <p class="eyebrow capability-card__index">${String(index + 1).padStart(2, '0')}</p>
        <h3>${name}</h3>
        <p>${description}</p>
      </article>
    `
  )
  .join('');

const processSteps = siteContent.process
  .map(
    ({ title, description }, index) => `
      <li class="process-step">
        <p class="eyebrow process-step__index">${String(index + 1).padStart(2, '0')}</p>
        <h3 class="process-step__title">${title}</h3>
        <p class="process-step__description">${description}</p>
      </li>
    `
  )
  .join('');

const isMeaningfullyVisible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);

  if (visibleHeight <= 0 || visibleWidth <= 0) {
    return false;
  }

  return visibleHeight >= rect.height * 0.6;
};

app.innerHTML = `
  <main class="page-shell">
    <section class="hero">
      <div class="hero__content">
        <p class="hero__brand">
          <span class="hero__brand-mark">${brandWordmark}</span>
          ${brandSuffix ? `<span class="hero__brand-suffix">${brandSuffix}</span>` : ''}
        </p>
        <h1>${siteContent.hero.title}</h1>
        <p class="hero__description">${siteContent.hero.description}</p>
        <div class="hero__actions">
          <button
            class="button button--primary"
            type="button"
            aria-controls="audit-overview"
            data-action="focus-audit-overview"
          >
            ${siteContent.hero.primaryCta}
          </button>
          <span class="hero__note">${siteContent.hero.secondaryNote}</span>
        </div>
      </div>
      <aside
        class="hero__panel"
        id="audit-overview"
        aria-label="Audit overview"
      >
        <h2 class="hero__panel-title" tabindex="-1">Audit overview</h2>
        <p class="hero__panel-kicker">${siteContent.brand.audience}</p>
        <p class="hero__panel-copy">${auditPanelCopy}</p>
      </aside>
    </section>

    <section class="section section--paper" aria-labelledby="audit-scope-title">
      <div class="section__intro">
        <p class="eyebrow">Audit scope</p>
        <h2 id="audit-scope-title">What the review covers</h2>
      </div>
      <ul class="scope-list">
        ${scopeItems}
      </ul>
    </section>

    <section class="section section--split" aria-labelledby="problem-title">
      <div class="section__content-block">
        <p class="eyebrow">The problem</p>
        <h2 id="problem-title">${siteContent.problem.title}</h2>
      </div>
      <ol class="problem-list">
        ${problemItems}
      </ol>
    </section>

    <section class="section section--paper" aria-labelledby="capabilities-title">
      <div class="section__intro">
        <p class="eyebrow">Capabilities</p>
        <h2 id="capabilities-title">What TaylorMade builds and improves</h2>
      </div>
      <div class="capability-grid">
        ${capabilityItems}
      </div>
    </section>

    <section class="section section--process" aria-labelledby="process-title">
      <div class="section__intro">
        <p class="eyebrow">The process</p>
        <h2 id="process-title">How it works</h2>
      </div>
      <ol class="process-list">
        ${processSteps}
      </ol>
    </section>

    <section class="section section--cta" aria-labelledby="closing-cta-title">
      <h2 id="closing-cta-title">${siteContent.closingCta.title}</h2>
      <p class="cta-section__description">${siteContent.closingCta.description}</p>
      <button
        class="button button--primary"
        type="button"
        aria-controls="audit-overview"
        data-action="focus-audit-overview"
      >
        ${siteContent.closingCta.cta}
      </button>
    </section>
  </main>
`;

const auditCtaButtons = app.querySelectorAll<HTMLButtonElement>('[data-action="focus-audit-overview"]');
const auditOverview = app.querySelector<HTMLElement>('#audit-overview');
const auditOverviewHeading = app.querySelector<HTMLHeadingElement>('.hero__panel-title');

if (!auditCtaButtons.length || !auditOverview || !auditOverviewHeading) {
  throw new Error('Missing CTA buttons or audit overview panel focus target');
}

const handleAuditCtaClick = () => {
  const shouldScrollIntoView = !isMeaningfullyVisible(auditOverview);

  if (shouldScrollIntoView) {
    auditOverview.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    auditOverviewHeading.focus();
    return;
  }

  auditOverviewHeading.focus({ preventScroll: true });
};

auditCtaButtons.forEach((btn) => btn.addEventListener('click', handleAuditCtaClick));
