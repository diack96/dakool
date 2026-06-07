import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';
const UNSUB_URL = `${SITE_URL}/unsubscribe`;

export interface CourseAbandonedEmailProps {
  userName: string;
  courseTitle: string;
  progressPercent: number;
  courseUrl: string;
  daysSinceLastActivity: number;
}

function getProgressMessage(pct: number): string {
  if (pct >= 75) return `Vous êtes à ${pct}% — la ligne d'arrivée est toute proche !`;
  if (pct >= 50) return `Vous avez déjà fait ${pct}% du chemin. Ne vous arrêtez pas maintenant !`;
  return `Vous avez commencé et fait ${pct}%. Reprenez où vous en étiez !`;
}

// Génère une barre de progression textuelle compatible email
function getProgressBar(pct: number): string {
  const filled = Math.round(pct / 5); // 20 segments
  const empty = 20 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export default function CourseAbandonedEmail(data: CourseAbandonedEmailProps) {
  const msg = getProgressMessage(data.progressPercent);
  const isLong = data.daysSinceLastActivity >= 30;
  const progressBar = getProgressBar(data.progressPercent);

  return (
    <Layout preview={`${data.userName}, votre cours ${data.courseTitle} vous attend !`} unsubscribeUrl={UNSUB_URL}>
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>💪</Text>
      <Text style={{ color: '#111827', fontSize: '23px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' }}>
        {data.userName}, votre cours vous attend !
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 8px 0' }}>
        Vous n&apos;avez pas eu l&apos;occasion de continuer :
      </Text>
      <Text style={{ color: '#1e40af', fontSize: '18px', fontWeight: '700', textAlign: 'center', margin: '0 0 24px 0' }}>
        {data.courseTitle}
      </Text>

      {/* Barre de progression compatible email (texte monospace, pas de CSS overflow) */}
      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <Text style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Votre progression
        </Text>
        <Text style={{ color: '#2563eb', fontSize: '15px', fontFamily: 'monospace', margin: '0 0 8px 0', letterSpacing: '1px' }}>
          {progressBar}
        </Text>
        <Text style={{ color: '#111827', fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0' }}>
          {data.progressPercent}%
        </Text>
        <Text style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
          complété · {100 - data.progressPercent}% restant
        </Text>
      </Section>

      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 24px 0' }}>
        {msg}
      </Text>

      {isLong && (
        <Section style={infoBox('#fef3c7', '#f59e0b')}>
          <Text style={{ color: '#92400e', fontSize: '14px', margin: 0 }}>
            ⏰ Cela fait plus d&apos;un mois. C&apos;est le bon moment pour reprendre — votre certificat vous attend au bout !
          </Text>
        </Section>
      )}

      <Button href={data.courseUrl} style={btnStyle()}>▶ Reprendre le cours →</Button>

      <Section style={infoBox('#f0fdf4', '#22c55e')}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: 0 }}>
          🏆 À ce stade, un certificat vous attend au bout du chemin. Ne lâchez pas !
        </Text>
      </Section>
    </Layout>
  );
}

export async function courseAbandonedTemplate(data: CourseAbandonedEmailProps): Promise<{ html: string; text: string }> {
  return {
    html: await render(<CourseAbandonedEmail {...data} />),
    text: `${data.userName}, votre cours vous attend !

${data.courseTitle} — ${data.progressPercent}% complété

${getProgressBar(data.progressPercent)} ${data.progressPercent}%

${getProgressMessage(data.progressPercent)}

Reprendre le cours : ${data.courseUrl}
Ne plus recevoir ces rappels : ${UNSUB_URL}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
