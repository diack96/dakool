/**
 * Test direct de l'API Wave — diagnostique le 502 checkout.
 * Simule exactement ce que fait /api/wave/checkout côté serveur.
 *
 * Usage : node scripts/test-wave-api.mjs
 */
import { createHmac } from 'crypto';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Charger .env.local ────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '../.env.local');

const env = {};
try {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/[\r\n]+$/, '');
    env[key] = val;
  }
  console.log('✅ .env.local chargé\n');
} catch {
  console.error('❌ .env.local introuvable — lance depuis la racine du projet');
  process.exit(1);
}

const apiKey        = env.WAVE_API_KEY        ?? '';
const signingSecret = env.WAVE_SIGNING_SECRET ?? '';

console.log('═══════════════════════════════════════════');
console.log('  DIAGNOSTIC WAVE API — test-wave-api.mjs  ');
console.log('═══════════════════════════════════════════\n');

console.log('📋 Clés détectées :');
console.log(`  WAVE_API_KEY        : ${apiKey.slice(0, 25)}… (longueur: ${apiKey.length})`);
console.log(`  WAVE_SIGNING_SECRET : ${signingSecret.slice(0, 15)}… (longueur: ${signingSecret.length})\n`);

if (!apiKey || !signingSecret) {
  console.error('❌ Variables manquantes dans .env.local');
  process.exit(1);
}

// ─── Construire la signature ───────────────────────────────────────────
const body = JSON.stringify({
  amount:           '1000',
  currency:         'XOF',
  success_url:      'https://waraba-academy.com/test?wave_return=success',
  error_url:        'https://waraba-academy.com/test?wave_return=error',
  client_reference: 'test-diagnostic',
});

const timestamp     = Math.floor(Date.now() / 1000).toString();
const signedPayload = `${timestamp}${body}`;
const signature     = createHmac('sha256', signingSecret)
  .update(signedPayload, 'utf8')
  .digest('hex');
const waveSignature = `t=${timestamp},v1=${signature}`;

console.log('🔐 Signature générée :');
console.log(`  timestamp     : ${timestamp}`);
console.log(`  Wave-Signature: ${waveSignature.slice(0, 40)}…\n`);

// ─── Appel API Wave ────────────────────────────────────────────────────
console.log('📡 Appel POST https://api.wave.com/v1/checkout/sessions …\n');

try {
  const res = await fetch('https://api.wave.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${apiKey}`,
      'Wave-Signature': waveSignature,
      'Content-Type':   'application/json',
    },
    body,
  });

  const data = await res.json().catch(() => ({}));

  console.log(`HTTP Status : ${res.status} ${res.statusText}`);
  console.log('Réponse Wave:', JSON.stringify(data, null, 2));
  console.log();

  if (res.ok) {
    console.log('✅ SUCCÈS — L\'API Wave accepte les requêtes depuis ta machine locale.');
    console.log('   → Le problème est spécifique à Vercel (IP différente).');
    console.log('   → Solution : désactiver le IP Whitelisting Wave ou vérifier que la liste est vide ET sauvegardée.');
  } else if (data?.code === 'ip-not-allowed') {
    console.log('❌ ip-not-allowed DEPUIS TA MACHINE LOCALE aussi.');
    console.log('   → Le whitelist Wave est encore actif, ou il y a un whitelist au niveau organisation.');
    console.log('   → Vérifie Wave Portal → Settings → Organisation → Security');
  } else if (res.status === 401) {
    console.log('❌ 401 — WAVE_API_KEY invalide ou révoquée.');
    console.log('   → Vérifie la valeur dans .env.local ET dans Vercel env vars.');
  } else if (res.status === 403 && data?.code !== 'ip-not-allowed') {
    console.log('❌ 403 — Problème de signature ou compte Wave inactif.');
    console.log(`   → Code Wave : ${data?.code} — ${data?.message}`);
  } else {
    console.log(`⚠️  Erreur inattendue : ${res.status}`);
  }
} catch (err) {
  console.error('❌ Erreur réseau (impossible de joindre api.wave.com) :', err.message);
}
