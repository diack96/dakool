import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { h2, bodyText, infoBox, btnStyle } from './components/Layout';

export interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export default function PasswordResetEmail(data: PasswordResetEmailProps) {
  return (
    <Layout preview={`Réinitialisation de votre mot de passe — Waraba Academy`}>
      <Text style={{ textAlign: 'center', fontSize: '52px', margin: '0 0 8px 0' }}>🔐</Text>
      <Text style={h2}>Réinitialisation de mot de passe</Text>
      <Text style={bodyText}>Bonjour {data.userName},</Text>
      <Text style={bodyText}>
        Vous avez demandé à réinitialiser votre mot de passe Waraba Academy.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
      </Text>

      <Button href={data.resetUrl} style={btnStyle()}>Réinitialiser mon mot de passe →</Button>

      {/* Expiry notice */}
      <Section style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
        <Text style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
          ⏱ Ce lien est valable pendant <strong>{data.expiresIn}</strong> seulement.
        </Text>
      </Section>

      {/* Security warning */}
      <Section style={infoBox('#fef3c7', '#f59e0b')}>
        <Text style={{ color: '#92400e', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '700' }}>
          ⚠️ Vous n&apos;avez pas fait cette demande ?
        </Text>
        <Text style={{ color: '#92400e', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
          Ignorez cet email — votre mot de passe restera inchangé.
          Si vous pensez que votre compte est compromis, contactez-nous immédiatement.
        </Text>
      </Section>

      {/* Tips */}
      <Section style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '8px' }}>
        <Text style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
          💡 <strong>Conseils pour un mot de passe sécurisé :</strong> au moins 8 caractères,
          mélangez majuscules, minuscules, chiffres et symboles. N&apos;utilisez pas
          le même mot de passe sur plusieurs sites.
        </Text>
      </Section>
    </Layout>
  );
}

export async function passwordResetTemplate(data: PasswordResetEmailProps): Promise<{ html: string; text: string }> {
  return {
    html: await render(<PasswordResetEmail {...data} />),
    text: `Réinitialisation de mot de passe — Waraba Academy

Bonjour ${data.userName},

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${data.resetUrl}

Ce lien expire dans ${data.expiresIn}.

Si vous n'avez pas fait cette demande, ignorez cet email.
Votre mot de passe restera inchangé.

© ${new Date().getFullYear()} Waraba Academy`,
  };
}
