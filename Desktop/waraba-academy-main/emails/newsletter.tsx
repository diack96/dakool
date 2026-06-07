import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';

export interface NewsletterEmailProps {
  userName?: string;
  unsubscribeUrl?: string;
}

const benefits = [
  { icon: '📚', text: 'Nouveaux cours et formations' },
  { icon: '💼', text: 'Conseils carrière exclusifs' },
  { icon: '🎁', text: 'Offres réservées aux abonnés' },
  { icon: '🌍', text: 'Actualités du marché tech en Afrique' },
];

export default function NewsletterEmail({ userName, unsubscribeUrl }: NewsletterEmailProps) {
  const unsubUrl = unsubscribeUrl || `${SITE_URL}/unsubscribe`;
  const greeting = userName ? `Bienvenue, ${userName} !` : 'Vous êtes inscrit !';
  return (
    <Layout preview="Bienvenue dans la newsletter Waraba Academy !" unsubscribeUrl={unsubUrl}>
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>✅</Text>
      <Text style={{ color: '#111827', fontSize: '24px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
        {greeting}
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 24px 0' }}>
        Merci de rejoindre la communauté Waraba Academy.{'\n'}
        Vous recevrez désormais :
      </Text>

      {/* Benefits list */}
      {benefits.map(({ icon, text }) => (
        <Section key={text} style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '8px',
          borderLeft: '3px solid #2563eb',
        }}>
          <Text style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
            {icon} {text}
          </Text>
        </Section>
      ))}

      <Button href={`${SITE_URL}/courses`} style={{ ...btnStyle(), marginTop: '24px' }}>
        Découvrir les formations →
      </Button>

      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
          🎯 Commencez par un cours <strong>gratuit</strong> — aucune carte bancaire requise.
        </Text>
      </Section>

      <Text style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center', margin: '16px 0 0 0' }}>
        Fréquence : 1 à 2 emails par semaine. Jamais de spam.
      </Text>
    </Layout>
  );
}

export async function newsletterConfirmationTemplate(data: NewsletterEmailProps): Promise<{ html: string; text: string }> {
  const unsubUrl = data.unsubscribeUrl || `${SITE_URL}/unsubscribe`;
  const greeting = data.userName ? `Bienvenue, ${data.userName} !` : 'Vous êtes inscrit !';
  return {
    html: await render(<NewsletterEmail {...data} />),
    text: `${greeting} — Newsletter Waraba Academy

Vous recevrez :
- Nouveaux cours et formations
- Conseils carrière exclusifs
- Offres réservées aux abonnés
- Actualités du marché tech en Afrique

Découvrir les formations : ${SITE_URL}/courses
Se désinscrire : ${unsubUrl}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
