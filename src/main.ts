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
  </main>
`;

const primaryCta = app.querySelector<HTMLButtonElement>('[data-action="focus-audit-overview"]');
const auditOverview = app.querySelector<HTMLElement>('#audit-overview');
const auditOverviewHeading = app.querySelector<HTMLHeadingElement>('.hero__panel-title');

if (!primaryCta || !auditOverview || !auditOverviewHeading) {
  throw new Error('Missing hero CTA or audit overview panel focus target');
}

primaryCta.addEventListener('click', () => {
  const shouldScrollIntoView = !isMeaningfullyVisible(auditOverview);

  if (shouldScrollIntoView) {
    auditOverview.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    auditOverviewHeading.focus();
    return;
  }

  auditOverviewHeading.focus({ preventScroll: true });
});