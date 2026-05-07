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