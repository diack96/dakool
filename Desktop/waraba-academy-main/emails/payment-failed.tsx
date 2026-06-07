import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';

export interface PaymentFailedEmailProps {
  userName: string;
  courseTitle: string;
  amount: number;
  currency: string;
  retryUrl: string;
  supportUrl?: string;
}

export default function PaymentFailedEmail(data: PaymentFailedEmailProps) {
  const support = data.supportUrl || `${SITE_URL}/contact`;
  return (
    <Layout preview={`Paiement non abouti — ${data.courseTitle}`}>
      <Text style={{ textAlign: 'center', fontSize: '48px', margin: '0 0 16px 0' }}>⚠️</Text>
      <Text style={{ color: '#111827', fontSize: '22px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
        Paiement non abouti
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', margin: '0 0 8px 0' }}>
        Bonjour {data.userName},
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
        Votre paiement pour le cours suivant n&apos;a pas pu être traité :
      </Text>
      <Section style={infoBox('#fef2f2', '#ef4444')}>
        <Text style={{ color: '#991b1b', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
          {data.courseTitle}
        </Text>
        <Text style={{ color: '#991b1b', margin: 0 }}>
          Montant : {data.amount.toLocaleString('fr-FR')} {data.currency}
        </Text>
      </Section>
      <Text style={{ color: '#374151', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
        Causes possibles : solde insuffisant, limite de transaction atteinte, ou problème temporaire de réseau.
        Votre place est réservée pendant encore <strong>24h</strong>.
      </Text>
      <Button href={data.retryUrl} style={btnStyle('#ef4444')}>🔄 Réessayer le paiement</Button>
      <Button href={support} style={{ ...btnStyle('#374151'), marginTop: '8px' }}>Contacter le support</Button>
      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
          💡 Nous acceptons Orange Money, Wave, MTN MoMo, Moov et carte bancaire.
        </Text>
      </Section>
    </Layout>
  );
}

export async function paymentFailedTemplate(data: PaymentFailedEmailProps): Promise<{ html: string; text: string }> {
  const support = data.supportUrl || `${SITE_URL}/contact`;
  return {
    html: await render(<PaymentFailedEmail {...data} />),
    text: `Paiement non abouti — Waraba Academy

Bonjour ${data.userName},

Votre paiement pour « ${data.courseTitle} » (${data.amount.toLocaleString('fr-FR')} ${data.currency}) n'a pas pu être traité.

Réessayer : ${data.retryUrl}
Support : ${support}

Votre place est réservée 24h.

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
