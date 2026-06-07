import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';

export interface PaymentReminderEmailProps {
  userName: string;
  courseTitle: string;
  amount: number;
  currency: string;
  paymentUrl: string;
}

export default function PaymentReminderEmail(data: PaymentReminderEmailProps) {
  return (
    <Layout preview={`${data.userName}, votre inscription à ${data.courseTitle} est incomplète`}>
      <Text style={{ textAlign: 'center', fontSize: '48px', margin: '0 0 16px 0' }}>⏳</Text>
      <Text style={{ color: '#111827', fontSize: '22px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
        Vous avez oublié quelque chose !
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', margin: '0 0 8px 0' }}>
        Bonjour {data.userName},
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
        Vous avez commencé votre inscription à ce cours mais n'avez pas finalisé votre paiement :
      </Text>

      <Section style={infoBox('#eff6ff', '#3b82f6')}>
        <Text style={{ color: '#1e40af', fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
          {data.courseTitle}
        </Text>
        <Text style={{ color: '#1e40af', margin: 0 }}>
          {data.amount.toLocaleString('fr-FR')} {data.currency} · Accès à vie · Certificat inclus
        </Text>
      </Section>

      <Text style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', margin: '0 0 8px 0' }}>
        ✅ Votre place est toujours disponible.
      </Text>
      <Text style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
        Des centaines d'étudiants ont déjà transformé leur carrière grâce à ce cours.
        Ne laissez pas passer cette opportunité.
      </Text>

      <Button href={data.paymentUrl} style={btnStyle()}>
        ✅ Finaliser mon inscription →
      </Button>

      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
          🛡️ Garantie satisfait ou remboursé 30 jours — Aucun risque.
        </Text>
      </Section>

      <Text style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', margin: '24px 0 0 0' }}>
        Si vous ne souhaitez plus recevoir ces emails,{' '}
        <a href={`${SITE_URL}/unsubscribe`} style={{ color: '#9ca3af' }}>
          cliquez ici
        </a>.
      </Text>
    </Layout>
  );
}

export async function paymentReminderTemplate(
  data: PaymentReminderEmailProps,
): Promise<{ html: string; text: string }> {
  return {
    html: await render(<PaymentReminderEmail {...data} />),
    text: `Bonjour ${data.userName},

Vous avez commencé votre inscription à « ${data.courseTitle} » mais n'avez pas finalisé votre paiement.

Montant : ${data.amount.toLocaleString('fr-FR')} ${data.currency}
Accès à vie · Certificat inclus · Garantie 30 jours

Finaliser mon inscription : ${data.paymentUrl}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
