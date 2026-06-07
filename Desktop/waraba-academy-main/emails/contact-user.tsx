import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';

export interface ContactUserEmailProps {
  firstName: string;
  subject: string;
}

export default function ContactUserEmail(data: ContactUserEmailProps) {
  return (
    <Layout preview={`Message bien reçu, ${data.firstName} ! Nous revenons vers vous sous 48h.`}>
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>📬</Text>
      <Text style={{ color: '#111827', fontSize: '24px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
        Message bien reçu, {data.firstName} !
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 24px 0' }}>
        Merci pour votre message concernant :<br />
        <strong>« {data.subject} »</strong>
      </Text>

      {/* Timeline */}
      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        padding: '20px 24px',
        marginBottom: '24px',
      }}>
        <Text style={{ color: '#111827', fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0' }}>
          Ce qui se passe ensuite :
        </Text>
        {([
          ['✅', 'Votre message a été reçu', 'Maintenant'],
          ['🔍', 'Notre équipe le lit et prépare une réponse', 'Sous 24h'],
          ['📧', 'Vous recevez notre réponse par email', 'Sous 48h ouvrables'],
        ] as [string, string, string][]).map(([icon, step, timing]) => (
          <Text key={step} style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>
            {icon} <strong>{timing}</strong> — {step}
          </Text>
        ))}
      </Section>

      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
          💡 En attendant notre réponse, explorez nos formations gratuites pour commencer à apprendre dès aujourd&apos;hui.
        </Text>
      </Section>

      <Button href={`${SITE_URL}/courses`} style={btnStyle()}>Voir les formations gratuites →</Button>
    </Layout>
  );
}

export async function contactConfirmationTemplate(data: ContactUserEmailProps): Promise<{ html: string; text: string }> {
  return {
    html: await render(<ContactUserEmail {...data} />),
    text: `Message bien reçu, ${data.firstName} !

Merci pour votre message concernant « ${data.subject} ».
Notre équipe vous répondra sous 24 à 48h ouvrables.

En attendant, explorez nos formations : ${SITE_URL}/courses

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
