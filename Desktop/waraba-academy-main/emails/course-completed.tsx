import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';

export interface CourseCompletedEmailProps {
  userName: string;
  courseTitle: string;
  courseUrl: string;
  hasQuiz: boolean;
  quizUrl?: string;
}

export default function CourseCompletedEmail(data: CourseCompletedEmailProps) {
  return (
    <Layout preview={`Bravo ${data.userName} ! Vous avez terminé ${data.courseTitle}`}>
      <Text style={{ textAlign: 'center', fontSize: '56px', margin: '0 0 8px 0' }}>🎓</Text>
      <Text style={{ color: '#111827', fontSize: '26px', fontWeight: '700', textAlign: 'center', margin: '0 0 8px 0' }}>
        Bravo, {data.userName} !
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 8px 0' }}>
        Vous avez terminé le cours :
      </Text>
      <Text style={{ color: '#1e40af', fontSize: '19px', fontWeight: '700', textAlign: 'center', margin: '0 0 28px 0' }}>
        {data.courseTitle}
      </Text>

      {/* Achievement badge */}
      <Section style={{
        backgroundColor: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '28px',
      }}>
        <Text style={{ fontSize: '32px', margin: '0 0 8px 0' }}>🌟</Text>
        <Text style={{ color: '#166534', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
          Cours complété à 100%
        </Text>
        <Text style={{ color: '#15803d', fontSize: '13px', margin: 0 }}>
          Vous faites partie des apprenants les plus assidus !
        </Text>
      </Section>

      {data.hasQuiz && data.quizUrl ? (
        <>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 8px 0' }}>
            Une dernière étape pour <strong>décrocher votre certificat</strong> :
          </Text>
          <Text style={{ color: '#7c3aed', fontSize: '15px', fontWeight: '700', textAlign: 'center', margin: '0 0 20px 0' }}>
            Passez le quiz final et obtenez votre attestation officielle !
          </Text>
          <Button href={data.quizUrl} style={btnStyle('#7c3aed')}>📝 Passer le quiz final →</Button>
          <Section style={infoBox('#f5f3ff', '#7c3aed')}>
            <Text style={{ color: '#5b21b6', fontSize: '14px', margin: 0 }}>
              💡 Le quiz valide vos acquis. Un score de 60% minimum est requis pour obtenir votre certificat.
            </Text>
          </Section>
        </>
      ) : (
        <>
          <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 20px 0' }}>
            Votre certificat est en cours de génération.
            Vous le recevrez très prochainement dans un email dédié.
          </Text>
          <Button href={data.courseUrl} style={btnStyle()}>Retourner au cours</Button>
          <Section style={infoBox()}>
            <Text style={{ color: '#1e40af', fontSize: '14px', margin: 0 }}>
              📚 En attendant, explorez nos autres formations pour continuer à progresser.
            </Text>
          </Section>
        </>
      )}

      <Section style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '8px' }}>
        <Button href={`${SITE_URL}/courses`} style={{ ...btnStyle('#374151') }}>
          Découvrir d&apos;autres formations
        </Button>
      </Section>
    </Layout>
  );
}

export async function courseCompletedTemplate(data: CourseCompletedEmailProps): Promise<{ html: string; text: string }> {
  return {
    html: await render(<CourseCompletedEmail {...data} />),
    text: `Bravo, ${data.userName} !

Vous avez terminé le cours : ${data.courseTitle}

${data.hasQuiz && data.quizUrl
  ? `Passez le quiz final pour obtenir votre certificat !\nQuiz : ${data.quizUrl}`
  : 'Votre certificat est en cours de génération. Vous le recevrez très prochainement.'}

Découvrir d'autres formations : ${SITE_URL}/courses

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
