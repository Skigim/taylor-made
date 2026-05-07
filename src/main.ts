import './styles.css';
import { siteContent } from './content/siteContent';

const app = document.querySelector<HTMLDivElement>('#app');
const auditPanelCopy =
  'The audit identifies what is working, what is costing time, and what to fix first.';

if (!app) {
  throw new Error('Missing #app root element');
}

const brandNameMatch = /^(.*?)(\s+LLC)$/.exec(siteContent.brand.name);
const brandWordmark = brandNameMatch?.[1] ?? siteContent.brand.name;
const brandSuffix = brandNameMatch?.[2].trim() ?? '';

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
        tabindex="-1"
        data-testid="audit-overview"
      >
        <p class="hero__panel-kicker">${siteContent.brand.audience}</p>
        <p class="hero__panel-copy">${auditPanelCopy}</p>
      </aside>
    </section>
  </main>
`;

const primaryCta = app.querySelector<HTMLButtonElement>('[data-action="focus-audit-overview"]');
const auditOverview = app.querySelector<HTMLElement>('#audit-overview');

if (!primaryCta || !auditOverview) {
  throw new Error('Missing hero CTA or audit overview panel');
}

primaryCta.addEventListener('click', () => {
  auditOverview.focus({ preventScroll: true });
});