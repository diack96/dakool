import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { h2, bodyText, btnStyle } from './components/Layout';

export interface WelcomeWithCourseEmailProps {
  userName: string;
  courseTitle: string;
  courseDescription: string;
  courseUrl: string;
  courseThumbnail?: string;
  dashboardUrl: string;
}

const steps = [
  { num: '✓', title: 'Créer votre compte', sub: "C'est fait !", done: true },
  { num: '2', title: 'Compléter votre profil', sub: 'Ajoutez vos informations', done: false },
  { num: '3', title: 'Suivre votre premier cours', sub: 'Commencez à apprendre !', done: false },
  { num: '4', title: 'Obtenir votre certificat', sub: 'Validez vos compétences', done: false },
];

export default function WelcomeWithCourseEmail(data: WelcomeWithCourseEmailProps) {
  const excerpt = data.courseDescription.length > 150
    ? data.courseDescription.substring(0, 150) + '…'
    : data.courseDescription;

  return (
    <Layout preview={`Bienvenue ${data.userName} ! Votre premier cours vous attend.`}>
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>🎉</Text>
      <Text style={h2}>Bienvenue, {data.userName} !</Text>
      <Text style={{ ...bodyText, textAlign: 'center', marginBottom: '28px' }}>
        Votre compte a été créé avec succès. Voici votre premier cours recommandé :
      </Text>

      {/* Course card — fond bleu solide (compatible Outlook) */}
      <Section style={{
        backgroundColor: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px',
      }}>
        <Text style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#1e40af', margin: '0 0 8px 0' }}>
          🚀 Votre premier cours
        </Text>
        <Text style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0' }}>
          {data.courseTitle}
        </Text>
        <Text style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px 0' }}>
          {excerpt}
        </Text>
        <Button href={data.courseUrl} style={btnStyle()}>Commencer maintenant →</Button>
      </Section>

      {/* Steps — chaque étape sur une ligne simple (pas de Text imbriqués) */}
      <Section style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <Text style={{ color: '#111827', fontSize: '15px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
          Vos prochaines étapes
        </Text>
        {steps.map((s) => (
          <Section key={s.num} style={{
            backgroundColor: s.done ? '#f0fdf4' : '#f9fafb',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '8px',
            borderLeft: s.done ? '3px solid #22c55e' : '3px solid #e5e7eb',
          }}>
            <Text style={{ margin: 0, fontSize: '14px', color: s.done ? '#166534' : '#111827', fontWeight: s.done ? '700' : '400' }}>
              {s.done ? '✅' : `${s.num}.`} {s.title} — {s.sub}
            </Text>
          </Section>
        ))}
        <Button href={data.dashboardUrl} style={{ ...btnStyle('#374151'), marginTop: '16px' }}>
          Accéder à mon tableau de bord
        </Button>
      </Section>
    </Layout>
  );
}

export async function welcomeWithCourseTemplate(data: WelcomeWithCourseEmailProps): Promise<{ html: string; text: string }> {
  const excerpt = data.courseDescription.length > 150
    ? data.courseDescription.substring(0, 150) + '…'
    : data.courseDescription;
  return {
    html: await render(<WelcomeWithCourseEmail {...data} />),
    text: `Bienvenue sur Waraba Academy, ${data.userName} !

Votre premier cours : ${data.courseTitle}
${excerpt}

Commencer maintenant : ${data.courseUrl}

Vos prochaines étapes :
✅ Créer votre compte — C'est fait !
2. Compléter votre profil
3. Suivre votre premier cours
4. Obtenir votre certificat

Tableau de bord : ${data.dashboardUrl}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
