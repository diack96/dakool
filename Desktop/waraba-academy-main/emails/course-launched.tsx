import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';

export interface CourseLaunchedEmailProps {
  userName: string;
  courseTitle: string;
  courseUrl: string;
  coursePrice?: number;
  isFree?: boolean;
}

export default function CourseLaunchedEmail(data: CourseLaunchedEmailProps) {
  const priceLabel = data.isFree || !data.coursePrice
    ? 'Gratuit'
    : `${data.coursePrice.toLocaleString('fr-FR')} FCFA`;

  return (
    <Layout preview={`🚀 "${data.courseTitle}" est maintenant disponible !`}>
      <Text style={{ textAlign: 'center', fontSize: '48px', margin: '0 0 16px 0' }}>🚀</Text>

      <Text style={{ color: '#111827', fontSize: '22px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
        Le cours est lancé !
      </Text>

      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', margin: '0 0 8px 0' }}>
        Bonjour {data.userName},
      </Text>

      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
        Bonne nouvelle ! Le cours que vous attendiez est maintenant disponible sur Waraba Academy :
      </Text>

      <Section style={infoBox('#eff6ff', '#3b82f6')}>
        <Text style={{ color: '#1e40af', fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0' }}>
          {data.courseTitle}
        </Text>
        <Text style={{ color: '#1e40af', margin: 0, fontSize: '14px' }}>
          Prix : {priceLabel}
        </Text>
      </Section>

      <Text style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0' }}>
        Commencez dès maintenant et progressez à votre rythme avec du contenu conçu pour les apprenants francophones d'Afrique.
      </Text>

      <Button href={data.courseUrl} style={{ ...btnStyle, backgroundColor: '#2563eb' }}>
        Accéder au cours →
      </Button>

      <Text style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', margin: '24px 0 0 0' }}>
        Vous recevez cet email car vous avez demandé à être notifié du lancement de ce cours.<br />
        <a href={`${SITE_URL}/dashboard`} style={{ color: '#9ca3af' }}>Gérer mes préférences</a>
      </Text>
    </Layout>
  );
}

export async function courseLaunchedTemplate(data: CourseLaunchedEmailProps) {
  return {
    subject: `🚀 "${data.courseTitle}" est maintenant disponible !`,
    html: await render(<CourseLaunchedEmail {...data} />),
    text: `Bonjour ${data.userName},\n\nLe cours "${data.courseTitle}" est maintenant disponible sur Waraba Academy.\n\nAccédez au cours : ${data.courseUrl}\n\nL'équipe Waraba Academy`,
  };
}
