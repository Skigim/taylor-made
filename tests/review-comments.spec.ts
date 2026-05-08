import { expect, test } from '@playwright/test';

import { escapeHtml, isRemoteGoogleFontRequest } from '../src/lib/html';

test('escapeHtml escapes characters that would be interpreted as markup', () => {
  expect(escapeHtml(`"><script>alert('xss')</script>&`)).toBe(
    '&quot;&gt;&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;&amp;'
  );
});

test('isRemoteGoogleFontRequest matches http, https, and protocol-relative URLs', () => {
  expect(isRemoteGoogleFontRequest('https://fonts.googleapis.com/css2?family=Manrope')).toBe(true);
  expect(isRemoteGoogleFontRequest('http://fonts.gstatic.com/s/manrope.woff2')).toBe(true);
  expect(isRemoteGoogleFontRequest('//fonts.googleapis.com/css2?family=Playfair+Display')).toBe(true);
  expect(isRemoteGoogleFontRequest('https://example.com/fonts.googleapis.com')).toBe(false);
});