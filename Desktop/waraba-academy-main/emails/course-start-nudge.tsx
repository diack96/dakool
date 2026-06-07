import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL    = 'https://waraba-academy.com';
const UNSUB_URL   = `${SITE_URL}/unsubscribe`;

export interface CourseStartNudgeEmailProps {
  userName: string;
  courseTitle: string;
  courseUrl: string;
  daysSinceEnrollment: number;
}

export default function CourseStartNudgeEmail(data: CourseStartNudgeEmailProps) {
  return (
    <Layout
      preview={`${data.userName}, votre cours ${data.courseTitle} vous attend — commencez maintenant !`}
      unsubscribeUrl={UNSUB_URL}
    >
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>🚀</Text>
      <Text style={{ color: '#111827', fontSize: '23px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
        {data.userName}, votre parcours commence maintenant !
      </Text>

      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 8px 0' }}>
        Il y a {data.daysSinceEnrollment} jours, vous avez rejoint&nbsp;:
      </Text>
      <Text style={{ color: '#1e40af', fontSize: '18px', fontWeight: '700', textAlign: 'center', margin: '0 0 24px 0' }}>
        {data.courseTitle}
      </Text>

      <Section style={infoBox('#eff6ff', '#3b82f6')}>
        <Text style={{ color: '#1e3a8a', fontSize: '15px', margin: 0, lineHeight: '1.7' }}>
          ✅ Votre place est réservée<br />
          ✅ Tout votre contenu est débloqué<br />
          ✅ Votre certificat vous attend à la fin
        </Text>
      </Section>

      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '16px 0 24px 0' }}>
        La première leçon ne prend que quelques minutes.<br />
        <strong>Commencez maintenant et prenez de l&apos;avance.</strong>
      </Text>

      <Button href={data.courseUrl} style={btnStyle()}>▶ Commencer la première leçon →</Button>

      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
          🏆 Les apprenants qui commencent dans les 3 premiers jours ont 3× plus de chances d&apos;obtenir leur certificat.
        </Text>
      </Section>
    </Layout>
  );
}

export async function courseStartNudgeTemplate(
  data: CourseStartNudgeEmailProps,
): Promise<{ html: string; text: string }> {
  return {
    html: await render(<CourseStartNudgeEmail {...data} />),
    text: `${data.userName}, votre cours vous attend !

Vous avez rejoint "${data.courseTitle}" il y a ${data.daysSinceEnrollment} jours mais n'avez pas encore commencé.

Votre place est réservée, tout votre contenu est débloqué.
Commencez la première leçon maintenant : ${data.courseUrl}

Ne plus recevoir ces rappels : ${UNSUB_URL}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
