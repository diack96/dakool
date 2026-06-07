import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

export interface ContactTeamEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactTeamEmail(data: ContactTeamEmailProps) {
  const receivedAt = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' });
  return (
    <Layout preview={`Nouveau contact de ${data.firstName} ${data.lastName} — ${data.subject}`}>
      <Text style={{ color: '#111827', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
        📬 Nouveau message de contact
      </Text>
      <Text style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 24px 0' }}>
        Reçu le {receivedAt} (heure de Dakar)
      </Text>

      {/* Sender info */}
      <Section style={infoBox()}>
        {([
          ['Nom', `${data.firstName} ${data.lastName}`],
          ['Email', data.email],
          ['Sujet', data.subject],
        ] as [string, string][]).map(([label, value]) => (
          <Text key={label} style={{ fontSize: '14px', color: '#374151', margin: '4px 0' }}>
            <strong>{label} :</strong> {value}
          </Text>
        ))}
      </Section>

      {/* Message body */}
      <Text style={{ color: '#111827', fontSize: '14px', fontWeight: '700', margin: '20px 0 10px 0' }}>
        Message :
      </Text>
      <Section style={{
        backgroundColor: '#f9fafb',
        borderLeft: '4px solid #2563eb',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{ color: '#374151', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
          {data.message}
        </Text>
      </Section>

      <Button
        href={`mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}`}
        style={btnStyle()}
      >
        Répondre à {data.firstName} →
      </Button>

      <Section style={infoBox('#fef3c7', '#f59e0b')}>
        <Text style={{ color: '#92400e', fontSize: '13px', margin: 0 }}>
          ⏱ Objectif de réponse : 24 à 48h ouvrables. Répondez depuis votre client mail habituel.
        </Text>
      </Section>
    </Layout>
  );
}

export async function contactNotificationTemplate(data: ContactTeamEmailProps): Promise<{ html: string; text: string }> {
  const receivedAt = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' });
  return {
    html: await render(<ContactTeamEmail {...data} />),
    text: `Nouveau message de contact — Waraba Academy
Reçu le ${receivedAt}

De : ${data.firstName} ${data.lastName} <${data.email}>
Sujet : ${data.subject}

Message :
${data.message}`,
  };
}
