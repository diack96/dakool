import React from 'react';
import {
  Html, Head, Body, Container, Section,
  Img, Text, Link, Preview,
} from '@react-email/components';

const LOGO_URL = 'https://waraba-academy.com/waraba-academy.png';
const SUPPORT_EMAIL = 'contact@waraba-academy.com';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export default function Layout({ preview, children, unsubscribeUrl }: LayoutProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <Img src={LOGO_URL} alt="Waraba Academy" width={160} height={50}
                 style={{ display: 'block', margin: '0 auto' }} />
          </Section>

          {/* Card — fond blanc sur fond bleu marine = contraste maximal */}
          <Section style={card}>{children}</Section>

          {/* Footer */}
          <Section style={{ textAlign: 'center', paddingTop: '24px' }}>
            <Text style={footerText}>
              Des questions ?{' '}
              <Link href={`mailto:${SUPPORT_EMAIL}`} style={blueLink}>{SUPPORT_EMAIL}</Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Waraba Academy. Tous droits réservés.
            </Text>
            {unsubscribeUrl && (
              <Link href={unsubscribeUrl} style={{ color: '#64748b', fontSize: '12px' }}>
                Se désinscrire
              </Link>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
export const body: React.CSSProperties = {
  // Fond bleu marine profond — contraste net avec la carte blanche
  backgroundColor: '#0f172a',
  margin: 0,
  padding: '32px 0',
  fontFamily: 'Arial, Helvetica, sans-serif',
};
export const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 16px',
};
export const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '36px 32px',
  // Barre bleue brand en haut, bordure légère sur les 3 autres côtés
  borderTop: '6px solid #2563eb',
  borderRight: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0',
  borderLeft: '1px solid #e2e8f0',
};
export const footerText: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '4px 0',
  textAlign: 'center',
};
export const blueLink: React.CSSProperties = {
  color: '#60a5fa',
  textDecoration: 'none',
};
export const h2: React.CSSProperties = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '700',
  textAlign: 'center',
  margin: '0 0 16px 0',
};
export const bodyText: React.CSSProperties = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 16px 0',
};
export const infoBox = (bg = '#eff6ff', border = '#2563eb'): React.CSSProperties => ({
  backgroundColor: bg,
  borderLeft: `4px solid ${border}`,
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.7',
});
export const btnStyle = (color = '#2563eb'): React.CSSProperties => ({
  backgroundColor: color,
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'block',
  padding: '14px 32px',
  margin: '24px auto',
});
export const pill: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontWeight: '700',
  fontSize: '18px',
  padding: '8px 24px',
  borderRadius: '999px',
  display: 'inline-block',
  margin: '0 auto',
};
