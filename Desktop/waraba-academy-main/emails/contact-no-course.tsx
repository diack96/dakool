import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle, h2, bodyText } from './components/Layout';

const SITE_URL  = 'https://waraba-academy.com';
const UNSUB_URL = `${SITE_URL}/unsubscribe`;

export interface ContactNoCourseEmailProps {
  userName: string;
  catalogUrl: string;
  featuredCourseTitle?: string;
  featuredCourseUrl?: string;
  featuredCourseDescription?: string;
}

export default function ContactNoCourseEmail(data: ContactNoCourseEmailProps) {
  return (
    <Layout
      preview={`${data.userName}, vos formations Waraba Academy n'attendent que vous !`}
      unsubscribeUrl={UNSUB_URL}
    >
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>🌍</Text>
      <Text style={h2}>{data.userName}, votre formation vous attend !</Text>

      <Text style={{ ...bodyText, textAlign: 'center' }}>
        Vous faites partie de la communauté Waraba Academy, mais vous n'avez pas encore
        exploré nos formations. C'est le moment de franchir le pas !
      </Text>

      {/* Mise en avant cours vedette si fourni */}
      {data.featuredCourseTitle && data.featuredCourseUrl && (
        <Section style={{
          backgroundColor: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <Text style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#1e40af', margin: '0 0 8px 0' }}>
            ⭐ Formation recommandée
          </Text>
          <Text style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' }}>
            {data.featuredCourseTitle}
          </Text>
          {data.featuredCourseDescription && (
            <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              {data.featuredCourseDescription.length > 150
                ? data.featuredCourseDescription.substring(0, 150) + '…'
                : data.featuredCourseDescription}
            </Text>
          )}
          <Button href={data.featuredCourseUrl} style={btnStyle()}>
            Découvrir cette formation →
          </Button>
        </Section>
      )}

      {/* Avantages */}
      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '15px', margin: 0, lineHeight: '1.8' }}>
          ✅ Formations 100 % en ligne — à votre rythme<br />
          ✅ Certificat reconnu à la clé<br />
          ✅ Contenus adaptés au contexte africain<br />
          ✅ Communauté d'apprenants engagés
        </Text>
      </Section>

      <Text style={{ ...bodyText, textAlign: 'center', marginTop: '24px' }}>
        Des dizaines de formations vous attendent dans notre catalogue.<br />
        <strong>Commencez gratuitement dès aujourd'hui.</strong>
      </Text>

      <Button href={data.catalogUrl} style={btnStyle()}>
        Voir toutes les formations →
      </Button>

      <Section style={infoBox('#fefce8', '#eab308')}>
        <Text style={{ color: '#854d0e', fontSize: '14px', margin: 0 }}>
          💡 Les apprenants qui s'inscrivent à leur premier cours cette semaine bénéficient
          d'un accompagnement prioritaire de nos mentors.
        </Text>
      </Section>
    </Layout>
  );
}

export async function contactNoCourseTemplate(
  data: ContactNoCourseEmailProps,
): Promise<{ html: string; text: string }> {
  return {
    html: await render(<ContactNoCourseEmail {...data} />),
    text: `${data.userName}, votre formation vous attend !

Vous faites partie de la communauté Waraba Academy, mais vous n'avez pas encore exploré nos formations.
${data.featuredCourseTitle ? `\nFormation recommandée : ${data.featuredCourseTitle}\n${data.featuredCourseUrl}\n` : ''}
Nos formations :
✅ 100 % en ligne — à votre rythme
✅ Certificat reconnu
✅ Contenus adaptés au contexte africain
✅ Communauté d'apprenants engagés

Voir toutes les formations : ${data.catalogUrl}

Ne plus recevoir ces emails : ${UNSUB_URL}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
