import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { infoBox, btnStyle } from './components/Layout';

export interface CertificateEmailProps {
  userName: string;
  courseTitle: string;
  grade: number;
  certificateNumber: string;
  downloadUrl: string;
  verifyUrl: string;
  issuedAt: string;
}

function getMention(grade: number) {
  if (grade >= 90) return 'avec les félicitations du jury';
  if (grade >= 75) return 'avec mention Très Bien';
  if (grade >= 60) return 'avec mention Bien';
  return 'avec mention Assez Bien';
}

export default function CertificateEmail(data: CertificateEmailProps) {
  const formattedDate = new Date(data.issuedAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const mention = getMention(data.grade);

  return (
    <Layout preview={`🏆 Félicitations ${data.userName} ! Votre certificat est disponible.`}>
      <Text style={{ textAlign: 'center', fontSize: '56px', margin: '0 0 8px 0' }}>🏆</Text>
      <Text style={{ color: '#111827', fontSize: '26px', fontWeight: '700', textAlign: 'center', margin: '0 0 8px 0' }}>
        Félicitations, {data.userName} !
      </Text>
      <Text style={{ color: '#b45309', fontSize: '15px', fontStyle: 'italic', textAlign: 'center', margin: '0 0 20px 0' }}>
        {mention}
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7', textAlign: 'center', margin: '0 0 8px 0' }}>
        Vous avez complété avec succès :
      </Text>
      <Text style={{ color: '#1e40af', fontSize: '19px', fontWeight: '700', textAlign: 'center', margin: '0 0 28px 0' }}>
        {data.courseTitle}
      </Text>

      {/* Certificate badge — fond solide (compatible Outlook, pas de gradient) */}
      <Section style={{
        backgroundColor: '#fffbeb',
        border: '2px solid #d4a843',
        borderRadius: '12px',
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: '28px',
      }}>
        <Text style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#92400e', margin: '0 0 12px 0' }}>
          🎓 Certificat d&apos;Achèvement
        </Text>
        <Text style={{ fontSize: '44px', fontWeight: '700', color: '#0f1b3d', margin: '0 0 4px 0', lineHeight: '1' }}>
          {data.grade}%
        </Text>
        <Text style={{ fontSize: '14px', color: '#b45309', fontWeight: '600', margin: '0 0 16px 0' }}>
          {mention}
        </Text>
        <Text style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
          N° {data.certificateNumber} · Délivré le {formattedDate}
        </Text>
      </Section>

      <Button href={data.downloadUrl} style={btnStyle('#0f1b3d')}>⬇️ Télécharger mon certificat</Button>
      <Button href={data.verifyUrl} style={{ ...btnStyle(), marginTop: '8px' }}>🔗 Page de vérification</Button>

      <Section style={infoBox()}>
        <Text style={{ color: '#1e40af', fontSize: '14px', margin: '0 0 6px 0', fontWeight: '700' }}>
          💡 Valorisez votre certificat
        </Text>
        <Text style={{ color: '#374151', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
          Partagez-le sur <strong>LinkedIn</strong>, ajoutez-le à votre CV ou envoyez
          le lien de vérification directement à un recruteur.
        </Text>
      </Section>
    </Layout>
  );
}

export async function certificateObtainedTemplate(data: CertificateEmailProps): Promise<{ html: string; text: string }> {
  const formattedDate = new Date(data.issuedAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return {
    html: await render(<CertificateEmail {...data} />),
    text: `Félicitations, ${data.userName} !

Vous avez obtenu votre certificat pour :
${data.courseTitle}

Note : ${data.grade}% — ${getMention(data.grade)}
N° certificat : ${data.certificateNumber}
Délivré le : ${formattedDate}

Télécharger : ${data.downloadUrl}
Vérifier : ${data.verifyUrl}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
