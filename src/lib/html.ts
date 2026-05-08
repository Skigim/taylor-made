const REMOTE_GOOGLE_FONT_REQUEST = /^(?:https?:)?\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//i;

export const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const isRemoteGoogleFontRequest = (url: string) => REMOTE_GOOGLE_FONT_REQUEST.test(url);