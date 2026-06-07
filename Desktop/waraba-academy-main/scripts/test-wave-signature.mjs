/**
 * Script de diagnostic Wave webhook signature.
 * Usage : node scripts/test-wave-signature.mjs [signatureHeader] [rawBody]
 *
 * Sans arguments → génère une signature valide de test et la vérifie.
 * Avec arguments → vérifie un header + body réels copiés depuis les logs Vercel.
 */
import { createHmac } from 'crypto';

const SECRET = process.env.WAVE_WEBHOOK_SECRET
  ?? 'wave_sn_WHS_5ggkyp8rqy77tdfz5wjgy0bzwqkpdnw9z5z9pymvwwd9pzd05d10';

const signatureHeaderArg = process.argv[2];
const rawBodyArg         = process.argv[3];

function hmac(secret, payload) {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

function check(label, sigHex, expectedHex) {
  const match = sigHex === expectedHex;
  console.log(`  [${match ? '✅' : '❌'}] ${label}`);
  if (!match) {
    console.log(`       attendu : ${expectedHex.slice(0, 20)}…`);
    console.log(`       reçu    : ${sigHex.slice(0, 20)}…`);
  }
  return match;
}

// ─────────────────────────────────────────────────────────────────
// MODE 1 : vérification d'un header + body réels
// ─────────────────────────────────────────────────────────────────
if (signatureHeaderArg && rawBodyArg) {
  console.log('\n=== MODE VÉRIFICATION (header + body réels) ===\n');

  const parts     = signatureHeaderArg.split(',');
  const tsPart    = parts.find(p => p.startsWith('t='));
  const v1Parts   = parts.filter(p => p.startsWith('v1='));

  if (!tsPart || v1Parts.length === 0) {
    console.error('Header invalide — format attendu: t=123456,v1=abcdef');
    process.exit(1);
  }

  const ts  = tsPart.slice(2);
  const sig = v1Parts[0].slice(3);

  console.log(`Timestamp      : ${ts}`);
  console.log(`Signature Wave : ${sig.slice(0, 20)}…`);
  console.log(`Secret (prefix): ${SECRET.slice(0, 12)}… (longueur: ${SECRET.length})`);
  console.log(`Body (debut)   : ${rawBodyArg.slice(0, 80)}`);
  console.log();

  const formats = [
    [`"${ts}.${rawBodyArg}"  (dot, Stripe-style)`,        hmac(SECRET, `${ts}.${rawBodyArg}`)],
    [`"${ts}${rawBodyArg}"   (no sep, Wave-style?)`,      hmac(SECRET, `${ts}${rawBodyArg}`)],
    [`"${rawBodyArg}"        (body seul)`,                 hmac(SECRET, rawBodyArg)],
    // Essai sans le préfixe "wave_sn_WHS_"
    [`dot   + secret sans préfixe`,  hmac(SECRET.replace(/^wave_sn_WHS_/, ''), `${ts}.${rawBodyArg}`)],
    [`noSep + secret sans préfixe`,  hmac(SECRET.replace(/^wave_sn_WHS_/, ''), `${ts}${rawBodyArg}`)],
  ];

  let found = false;
  for (const [label, expected] of formats) {
    if (check(label, sig, expected)) found = true;
  }

  if (!found) {
    console.log('\n❌ Aucun format ne correspond → le SECRET Vercel est probablement incorrect.\n');
  }

// ─────────────────────────────────────────────────────────────────
// MODE 2 : génération de test (aucun argument)
// ─────────────────────────────────────────────────────────────────
} else {
  console.log('\n=== MODE TEST (génération + vérification locale) ===\n');

  const body      = JSON.stringify({ type: 'checkout.session.completed', data: { id: 'test-123' } });
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Format dot (Stripe-style, implémenté dans le webhook handler actuel)
  const payloadDot   = `${timestamp}.${body}`;
  const sigDot       = hmac(SECRET, payloadDot);
  const headerDot    = `t=${timestamp},v1=${sigDot}`;

  // Format no-sep (même format que les requêtes sortantes Wave)
  const payloadNoDot = `${timestamp}${body}`;
  const sigNoDot     = hmac(SECRET, payloadNoDot);
  const headerNoDot  = `t=${timestamp},v1=${sigNoDot}`;

  console.log('Secret utilisé :', SECRET.slice(0, 12) + '… (longueur: ' + SECRET.length + ')');
  console.log('Body test      :', body.slice(0, 80));
  console.log('Timestamp      :', timestamp);
  console.log();
  console.log('Header avec DOT    :', headerDot);
  console.log('Header sans sépar  :', headerNoDot);
  console.log();
  console.log('Pour tester avec un vrai header Wave, relancez :');
  console.log('  node scripts/test-wave-signature.mjs "t=...,v1=..." \'{"type":...}\'');
}
