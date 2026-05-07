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
        <p class="hero__brand">
          <span class="hero__brand-mark">${siteContent.brand.wordmark}</span>
          <span class="hero__brand-suffix">${siteContent.brand.legalSuffix}</span>
        </p>
        <h1>${siteContent.hero.title}</h1>
        <p class="hero__description">${siteContent.hero.description}</p>
        <div class="hero__actions">
          <button class="button button--primary" type="button" aria-controls="audit-overview">
            ${siteContent.hero.primaryCta}
          </button>
          <span class="hero__note">${siteContent.hero.secondaryNote}</span>
        </div>
      </div>
      <aside class="hero__panel" id="audit-overview" aria-label="Audit overview" tabindex="-1">
        <p class="hero__panel-kicker">${siteContent.brand.audience}</p>
        <p class="hero__panel-copy">${siteContent.hero.auditPanelCopy}</p>
      </aside>
    </section>
  </main>
`;

const primaryCta = app.querySelector<HTMLButtonElement>('.button--primary');
const auditOverview = app.querySelector<HTMLElement>('#audit-overview');

if (!primaryCta || !auditOverview) {
  throw new Error('Missing hero CTA or audit overview panel');
}

primaryCta.addEventListener('click', () => {
  auditOverview.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  auditOverview.focus();
});