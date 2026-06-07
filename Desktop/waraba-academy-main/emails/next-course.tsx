import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL  = 'https://waraba-academy.com';
const UNSUB_URL = `${SITE_URL}/unsubscribe`;

export interface NextCourseEmailProps {
  userName: string;
  completedCourseTitle: string;
  nextCourseTitle: string;
  nextCourseUrl: string;
  nextCourseDescription?: string;
  catalogUrl: string;
}

export default function NextCourseEmail(data: NextCourseEmailProps) {
  return (
    <Layout
      preview={`Bravo ${data.userName} ! Votre prochain cours vous attend`}
      unsubscribeUrl={UNSUB_URL}
    >
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>🎯</Text>
      <Text style={{ color: '#111827', fontSize: '23px', fontWeight: '700', textAlign: 'center', margin: '0 0 8px 0' }}>
        Continuez sur votre lancée, {data.userName} !
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 4px 0' }}>
        Vous avez terminé :
      </Text>
      <Text style={{ color: '#15803d', fontSize: '17px', fontWeight: '700', textAlign: 'center', margin: '0 0 24px 0' }}>
        ✅ {data.completedCourseTitle}
      </Text>

      <Section style={{
        backgroundColor: '#f0f9ff',
        border: '2px solid #0ea5e9',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
      }}>
        <Text style={{ color: '#0c4a6e', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' }}>
          Cours recommandé pour vous
        </Text>
        <Text style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>
          {data.nextCourseTitle}
        </Text>
        {data.nextCourseDescription && (
          <Text style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            {data.nextCourseDescription}
          </Text>
        )}
      </Section>

      <Button href={data.nextCourseUrl} style={btnStyle()}>
        Commencer ce cours →
      </Button>

      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: 0, lineHeight: '1.7' }}>
          🏆 Les apprenants qui enchaînent les cours progressent <strong>2× plus vite</strong> et obtiennent de meilleures opportunités.
        </Text>
      </Section>

      <Section style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '8px', textAlign: 'center' as const }}>
        <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 12px 0' }}>
          Ou explorez tout notre catalogue de formations
        </Text>
        <Button href={data.catalogUrl} style={{ ...btnStyle('#374151') }}>
          Voir toutes les formations
        </Button>
      </Section>
    </Layout>
  );
}

export async function nextCourseTemplate(
  data: NextCourseEmailProps,
): Promise<{ html: string; text: string }> {
  return {
    html: await render(<NextCourseEmail {...data} />),
    text: `${data.userName}, continuez sur votre lancée !

Vous avez terminé : ${data.completedCourseTitle}

Cours recommandé pour vous : ${data.nextCourseTitle}
${data.nextCourseDescription ? `\n${data.nextCourseDescription}\n` : ''}
Commencez maintenant : ${data.nextCourseUrl}

Voir toutes les formations : ${data.catalogUrl}

Ne plus recevoir ces emails : ${UNSUB_URL}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
