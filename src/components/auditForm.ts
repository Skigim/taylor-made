import { AUDIT_API_URL } from '../config';
import { AuditFormData } from '../types/content';

type ValidatorFn = (value: string) => string;

const validators: Record<string, ValidatorFn> = {
  fullName: (v) => (v.trim().length >= 2 ? '' : 'Please enter your full name.'),
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ''
      : 'Please enter a valid email address.',
  businessName: (v) => (v.trim().length > 0 ? '' : 'Please enter your business name.'),
  businessType: (v) => (v !== '' ? '' : 'Please select a business type.'),
  phone: (v) =>
    /^[0-9\s\-()+]{7,}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.',
  city: (v) => (v.trim().length > 0 ? '' : 'Please enter your city or location.'),
};

interface FieldDescriptor {
  name: string;
  inputId: string;
  errorId: string;
}

const REQUIRED_FIELDS: FieldDescriptor[] = [
  { name: 'fullName', inputId: 'audit-full-name', errorId: 'audit-full-name-error' },
  { name: 'email', inputId: 'audit-email', errorId: 'audit-email-error' },
  { name: 'businessName', inputId: 'audit-business-name', errorId: 'audit-business-name-error' },
  { name: 'businessType', inputId: 'audit-business-type', errorId: 'audit-business-type-error' },
  { name: 'phone', inputId: 'audit-phone', errorId: 'audit-phone-error' },
  { name: 'city', inputId: 'audit-city', errorId: 'audit-city-error' },
];

export function createAuditForm(onClose: () => void): HTMLElement {
  const form = document.createElement('form');
  form.className = 'audit-form';
  form.noValidate = true;
  form.autocomplete = 'off';

  form.innerHTML = `
    <fieldset class="audit-form__fieldset">
      <div class="audit-form__required">
        <div class="form-field">
          <label for="audit-full-name">Full Name</label>
          <input id="audit-full-name" name="fullName" type="text" autocomplete="off" required />
          <p class="form-field__error" id="audit-full-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-email">Email</label>
          <input id="audit-email" name="email" type="email" autocomplete="off" required />
          <p class="form-field__error" id="audit-email-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-name">Business Name</label>
          <input id="audit-business-name" name="businessName" type="text" autocomplete="off" required />
          <p class="form-field__error" id="audit-business-name-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-business-type">Business Type</label>
          <select id="audit-business-type" name="businessType" required>
            <option value="">Select one</option>
            <option value="Salon">Salon</option>
            <option value="Barber Shop">Barber Shop</option>
            <option value="Other">Other</option>
          </select>
          <p class="form-field__error" id="audit-business-type-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-phone">Phone</label>
          <input id="audit-phone" name="phone" type="tel" autocomplete="off" required />
          <p class="form-field__error" id="audit-phone-error" aria-live="polite"></p>
        </div>
        <div class="form-field">
          <label for="audit-city">City / Location</label>
          <input id="audit-city" name="city" type="text" autocomplete="off" required />
          <p class="form-field__error" id="audit-city-error" aria-live="polite"></p>
        </div>
      </div>
      <div class="audit-form__optional">
        <button
          type="button"
          class="audit-form__optional-toggle"
          aria-expanded="false"
          aria-controls="audit-optional-fields"
        >
          <span>Tell us more about your business</span>
          <svg class="audit-form__chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div id="audit-optional-fields" class="audit-form__optional-fields" hidden>
          <div class="form-field">
            <label for="audit-pain-points">
              What's your biggest pain point right now?
              <span class="form-field__optional">(optional)</span>
            </label>
            <textarea id="audit-pain-points" name="painPoints" rows="3"></textarea>
          </div>
          <div class="form-field">
            <label for="audit-team-size">
              Team size <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-team-size" name="teamSize">
              <option value="">Select one</option>
              <option value="Just me">Just me</option>
              <option value="2–5">2–5</option>
              <option value="6–10">6–10</option>
              <option value="10+">10+</option>
            </select>
          </div>
          <div class="form-field">
            <label for="audit-referral">
              How did you hear about us?
              <span class="form-field__optional">(optional)</span>
            </label>
            <select id="audit-referral" name="referralSource">
              <option value="">Select one</option>
              <option value="Google">Google</option>
              <option value="Referral">Referral</option>
              <option value="Social media">Social media</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </fieldset>
    <div class="audit-form__footer">
      <p class="audit-form__submit-error" aria-live="polite" hidden></p>
      <button type="submit" class="button button--primary audit-form__submit" disabled>
        Get my free audit
      </button>
    </div>
  `;

  const fieldset = form.querySelector<HTMLFieldSetElement>('.audit-form__fieldset');
  const submitBtn = form.querySelector<HTMLButtonElement>('.audit-form__submit');
  const submitError = form.querySelector<HTMLParagraphElement>('.audit-form__submit-error');
  const optionalToggle = form.querySelector<HTMLButtonElement>('.audit-form__optional-toggle');
  const optionalFields = form.querySelector<HTMLElement>('#audit-optional-fields');

  if (!fieldset || !submitBtn || !submitError || !optionalToggle || !optionalFields) {
    throw new Error('Missing audit form controls');
  }

  optionalToggle.addEventListener('click', () => {
    const expanded = optionalToggle.getAttribute('aria-expanded') === 'true';
    optionalToggle.setAttribute('aria-expanded', String(!expanded));
    optionalFields.hidden = expanded;
  });

  const getInput = (id: string) =>
    form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`#${id}`);

  const validateField = (descriptor: FieldDescriptor): boolean => {
    const field = getInput(descriptor.inputId);
    const errorEl = form.querySelector<HTMLElement>(`#${descriptor.errorId}`);
    if (!field || !errorEl) return true;
    const validate = validators[descriptor.name];
    if (!validate) return true;
    const error = validate(field.value);
    errorEl.textContent = error;
    return error === '';
  };

  const updateSubmitState = () => {
    const allValid = REQUIRED_FIELDS.every((descriptor) => {
      const field = getInput(descriptor.inputId);
      const validate = validators[descriptor.name];
      return field && validate && validate(field.value) === '';
    });
    submitBtn.disabled = !allValid;
  };

  REQUIRED_FIELDS.forEach((descriptor) => {
    const field = getInput(descriptor.inputId);
    if (!field) return;
    field.addEventListener('blur', () => {
      validateField(descriptor);
      updateSubmitState();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const allValid = REQUIRED_FIELDS.every((descriptor) => validateField(descriptor));
    if (!allValid) {
      updateSubmitState();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    fieldset.disabled = true;
    submitError.hidden = true;

    const data: AuditFormData = {
      fullName: (getInput('audit-full-name') as HTMLInputElement).value.trim(),
      email: (getInput('audit-email') as HTMLInputElement).value.trim(),
      businessName: (getInput('audit-business-name') as HTMLInputElement).value.trim(),
      businessType: (getInput('audit-business-type') as HTMLSelectElement)
        .value as AuditFormData['businessType'],
      phone: (getInput('audit-phone') as HTMLInputElement).value.trim(),
      city: (getInput('audit-city') as HTMLInputElement).value.trim(),
    };

    const painPoints = (getInput('audit-pain-points') as HTMLTextAreaElement).value.trim();
    const teamSize = (getInput('audit-team-size') as HTMLSelectElement).value;
    const referralSource = (getInput('audit-referral') as HTMLSelectElement).value;

    if (painPoints) data.painPoints = painPoints;
    if (teamSize) data.teamSize = teamSize as AuditFormData['teamSize'];
    if (referralSource) data.referralSource = referralSource as AuditFormData['referralSource'];

    try {
      const response = await fetch(AUDIT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      form.innerHTML = `
        <div class="audit-form__success" role="status">
          <h3 class="audit-form__success-title" aria-label="You're all set">You’re all set</h3>
          <p class="audit-form__success-body">We’ll review your business and be in touch within 24 hours.</p>
          <button type="button" class="button button--primary audit-form__success-close">Done</button>
        </div>
      `;

      form
        .querySelector<HTMLButtonElement>('.audit-form__success-close')
        ?.addEventListener('click', onClose);
    } catch {
      submitError.hidden = false;
      submitError.textContent = 'Something went wrong — please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get my free audit';
      fieldset.disabled = false;
    }
  });

  return form;
}