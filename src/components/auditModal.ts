export interface AuditModal {
  element: HTMLElement;
  open: (trigger: HTMLElement) => void;
  close: () => void;
}

export function createAuditModal(createForm: (onClose: () => void) => HTMLElement): AuditModal {
  let triggerElement: HTMLElement | null = null;
  let previousBodyOverflow = '';

  const overlay = document.createElement('div');
  overlay.id = 'audit-modal';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'audit-modal-title');
  overlay.hidden = true;

  const card = document.createElement('div');
  card.className = 'modal-card';

  const header = document.createElement('div');
  header.className = 'modal-header';

  const title = document.createElement('h2');
  title.id = 'audit-modal-title';
  title.className = 'modal-title';
  title.textContent = 'Request your free audit';

  const subline = document.createElement('p');
  subline.className = 'modal-subline';
  subline.textContent = 'No pressure, no pitch — just a clear look at where your systems stand.';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'modal-close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.innerHTML = '&times;';

  const body = document.createElement('div');
  body.className = 'modal-body';

  header.append(title, subline, closeButton);
  card.append(header, body);
  overlay.append(card);

  const getFocusableElements = () =>
    Array.from(
      card.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.closest('[hidden]') === null);

  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = previousBodyOverflow;
    document.removeEventListener('keydown', handleKeydown);

    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements();

    if (!focusableElements.length) {
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const open = (trigger: HTMLElement) => {
    triggerElement = trigger;
    body.replaceChildren(createForm(close));
    overlay.hidden = false;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);

    const [firstFocusable] = getFocusableElements();
    firstFocusable?.focus();
  };

  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  return { element: overlay, open, close };
}