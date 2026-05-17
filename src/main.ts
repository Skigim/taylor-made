import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import './styles.css';
import monogramUrl from './assets/tm-monogram.svg';
import { createAuditForm } from './components/auditForm';
import { createAuditModal } from './components/auditModal';
import { siteContent } from './content/siteContent';
import { escapeHtml } from './lib/html';

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

const capabilityKeywords = siteContent.auditScope
  .map((item) => `<li class="capability-keyword">${escapeHtml(item)}</li>`)
  .join('');

const problemItems = siteContent.problem.points
  .map(
    (point, index) => `
      <li class="problem-list__item">
        <span>${escapeHtml(point)}</span>
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
        <h3>${escapeHtml(name)}</h3>
        <p>${escapeHtml(description)}</p>
      </article>
    `
  )
  .join('');

const processSteps = siteContent.process
  .map(
    ({ title, description }, index) => `
      <li class="process-step">
        <p class="eyebrow process-step__index">${String(index + 1).padStart(2, '0')}</p>
        <h3 class="process-step__title">${escapeHtml(title)}</h3>
        <p class="process-step__description">${escapeHtml(description)}</p>
      </li>
    `
  )
  .join('');

app.innerHTML = `
  <main class="page-shell">
    <section class="hero">
      <div class="hero__content">
        <p class="hero__brand">
          <span class="hero__brand-mark">${escapeHtml(brandWordmark)}</span>
          ${brandSuffix ? `<span class="hero__brand-suffix">${escapeHtml(brandSuffix)}</span>` : ''}
        </p>
        <h1>${escapeHtml(siteContent.hero.title)}</h1>
        <p class="hero__description">${escapeHtml(siteContent.hero.description)}</p>
        <div class="hero__actions">
          <button
            class="button button--primary"
            type="button"
            aria-haspopup="dialog"
            aria-controls="audit-modal"
            data-action="open-audit-modal"
          >
            ${escapeHtml(siteContent.hero.primaryCta)}
          </button>
          <span class="hero__note">${escapeHtml(siteContent.hero.secondaryNote)}</span>
        </div>
      </div>
      <aside
        class="hero__panel"
        id="audit-overview"
        aria-label="Audit overview"
      >
        <img class="hero__mark" src="${monogramUrl}" alt="" aria-hidden="true" />
        <h2 class="hero__panel-title" tabindex="-1">Audit overview</h2>
        <p class="hero__panel-kicker">${escapeHtml(siteContent.brand.audience)}</p>
        <p class="hero__panel-copy">${escapeHtml(auditPanelCopy)}</p>

        <section class="hero__panel-section" aria-labelledby="problem-title">
          <p class="eyebrow">The problem</p>
          <h3 class="hero__panel-section-title" id="problem-title">${escapeHtml(siteContent.problem.title)}</h3>
          <ol class="problem-list problem-list--panel">
            ${problemItems}
          </ol>
        </section>
      </aside>
    </section>

    <section class="section section--paper" aria-labelledby="capabilities-title">
      <div class="section__intro">
        <p class="eyebrow">Capabilities</p>
        <h2 id="capabilities-title">What TaylorMade builds and improves</h2>
      </div>
      <ul class="capability-keywords" aria-label="What TaylorMade builds keywords">
        ${capabilityKeywords}
      </ul>
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
      <h2 id="closing-cta-title">${escapeHtml(siteContent.closingCta.title)}</h2>
      <p class="cta-section__description">${escapeHtml(siteContent.closingCta.description)}</p>
      <button
        class="button button--primary"
        type="button"
        aria-haspopup="dialog"
        aria-controls="audit-modal"
        data-action="open-audit-modal"
      >
        ${escapeHtml(siteContent.closingCta.cta)}
      </button>
    </section>
  </main>
`;

const auditCtaButtons = app.querySelectorAll<HTMLButtonElement>('[data-action="open-audit-modal"]');

if (!auditCtaButtons.length) {
  throw new Error('Missing audit CTA buttons');
}

const auditModal = createAuditModal((onClose) => createAuditForm(onClose));

document.body.append(auditModal.element);

auditCtaButtons.forEach((button) =>
  button.addEventListener('click', () => auditModal.open(button))
);
