import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { h2, bodyText, infoBox, btnStyle } from './components/Layout';

export interface EnrollmentEmailProps {
  userName: string;
  courseTitle: string;
  courseUrl: string;
  enrollmentDate: string;
  isFreeCourse: boolean;
  amount?: number;
  currency?: string;
}

export default function EnrollmentEmail(data: EnrollmentEmailProps) {
  const formattedDate = new Date(data.enrollmentDate).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Layout preview={`Votre inscription à ${data.courseTitle} est confirmée !`}>
      <Text style={{ textAlign: 'center', fontSize: '48px', margin: '0 0 16px 0' }}>✅</Text>
      <Text style={h2}>Inscription confirmée !</Text>

      <Text style={bodyText}>Bonjour {data.userName},</Text>
      <Text style={bodyText}>
        {data.isFreeCourse
          ? 'Votre inscription au cours suivant a été confirmée :'
          : 'Votre paiement a été traité avec succès et votre inscription est confirmée :'}
      </Text>

      <Section style={infoBox()}>
        <Text style={{ color: '#1e40af', fontSize: '17px', fontWeight: '700', margin: '0 0 4px 0' }}>
          {data.courseTitle}
        </Text>
        <Text style={{ color: '#3b82f6', fontSize: '14px', margin: 0 }}>
          Date d&apos;inscription : {formattedDate}
        </Text>
      </Section>

      {!data.isFreeCourse && data.amount && (
        <Section style={infoBox('#f0fdf4', '#22c55e')}>
          <Text style={{ color: '#166534', fontWeight: '700', margin: '0 0 4px 0' }}>Détails du paiement</Text>
          <Text style={{ color: '#15803d', margin: 0 }}>
            Montant réglé : {data.amount.toLocaleString('fr-FR')} {data.currency || 'FCFA'}
          </Text>
        </Section>
      )}

      <Button href={data.courseUrl} style={btnStyle()}>Accéder au cours →</Button>

      <Section style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '8px' }}>
        <Text style={{ color: '#111827', fontSize: '14px', fontWeight: '700', margin: '0 0 10px 0' }}>
          Ce que vous obtenez :
        </Text>
        {['✓ Accès illimité au contenu du cours', '✓ Certificat de réussite',
          '✓ Support par email', '✓ Mises à jour gratuites'].map(item => (
          <Text key={item} style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>{item}</Text>
        ))}
      </Section>
    </Layout>
  );
}

export async function enrollmentConfirmationTemplate(data: EnrollmentEmailProps): Promise<{ html: string; text: string }> {
  const formattedDate = new Date(data.enrollmentDate).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return {
    html: await render(<EnrollmentEmail {...data} />),
    text: `Inscription confirmée — Waraba Academy

Bonjour ${data.userName},

${data.isFreeCourse ? 'Votre inscription au cours suivant a été confirmée :' : 'Votre paiement a été traité avec succès :'}

Cours : ${data.courseTitle}
Date : ${formattedDate}
${!data.isFreeCourse && data.amount ? `Montant : ${data.amount.toLocaleString('fr-FR')} ${data.currency || 'FCFA'}` : ''}

Accéder au cours : ${data.courseUrl}

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
