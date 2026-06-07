/**
 * Sanitisation HTML isomorphe (client + serveur).
 * - Serveur (SSR/Node.js) : sanitize-html
 * - Client (navigateur)   : DOMPurify
 *
 * SECURITY: Le rendu SSR retournait le HTML brut sans sanitisation.
 * Correctif : sanitize-html est utilisé côté serveur pour éliminer
 * tout vecteur XSS avant injection dans dangerouslySetInnerHTML.
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'span', 'div',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'class', 'target', 'rel', 'width', 'height'];

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Serveur (SSR) : sanitize-html est compatible Node.js
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sanitizeHtmlLib = require('sanitize-html') as (html: string, opts: object) => string;
    return sanitizeHtmlLib(html, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height'],
        '*': ['class'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesAppliedToAttributes: ['href', 'src'],
    });
  }

  // Client : DOMPurify (requiert window/document)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require('dompurify');
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target'],
    FORCE_BODY: false,
  }) as string;
}
