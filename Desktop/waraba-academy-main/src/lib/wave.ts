import { createHmac } from 'crypto';

const WAVE_API_URL = 'https://api.wave.com/v1';
const WAVE_PROXY_URL = process.env.WAVE_PROXY_URL ?? '';

/**
 * Nettoie une variable d'env corrompue (BOM UTF-8, \n litéral, CRLF).
 */
export function cleanEnvVar(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/^﻿/, '')
    .replace(/\\r\\n$/, '')
    .replace(/\\n$/, '')
    .replace(/[\r\n\t]+$/, '')
    .trim();
}

/**
 * Construit le header Wave-Signature pour signer une requête sortante vers l'API Wave.
 *
 * Format  : Wave-Signature: t={timestamp},v1={hmac_sha256_hex}
 * Payload : "{timestamp}{body}"  (timestamp collé au body, sans séparateur)
 *
 * Note : Wave utilise la même structure que pour les webhooks mais le secret
 * est la "signing secret" (distincte de la WAVE_API_KEY et de la WAVE_WEBHOOK_SECRET).
 * Elle est affichée une seule fois à la création de la clé API.
 *
 * Docs : https://docs.wave.com/business#request-signing
 */
export function buildWaveSignatureHeader(body: string, signingSecret: string): string {
  const timestamp     = Math.floor(Date.now() / 1000).toString();
  const signedPayload = `${timestamp}${body}`;
  const signature     = createHmac('sha256', signingSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Effectue un appel authentifié et signé vers l'API Wave.
 *
 * @param path          Chemin relatif, ex. "/checkout/sessions"
 * @param method        "GET" | "POST"
 * @param body          Objet JS sérialisé en JSON (POST uniquement)
 * @param apiKey        WAVE_API_KEY (Bearer token)
 * @param signingSecret WAVE_SIGNING_SECRET (pour Wave-Signature)
 */
export async function waveRequest(
  path:          string,
  method:        'GET' | 'POST',
  body:          Record<string, unknown> | null,
  apiKey:        string,
  signingSecret: string,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const rawBody = body ? JSON.stringify(body) : '';

  const headers: Record<string, string> = {
    'Authorization':  `Bearer ${apiKey}`,
    'Wave-Signature': buildWaveSignatureHeader(rawBody, signingSecret),
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  // Si WAVE_PROXY_URL est défini, router via le VPS (IP fixe whitelistée chez Wave)
  const targetUrl = (WAVE_PROXY_URL && path === '/checkout/sessions')
    ? `${WAVE_PROXY_URL}/wave-checkout`
    : `${WAVE_API_URL}${path}`;

  const res = await fetch(targetUrl, {
    method,
    headers,
    ...(rawBody ? { body: rawBody } : {}),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as Record<string, unknown> };
}
