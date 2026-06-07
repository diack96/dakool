import { Button, Section, Text } from '@react-email/components';
import { render } from '@react-email/render';
import Layout, { btnStyle } from './components/Layout';

const SITE_URL = 'https://waraba-academy.com';

export interface AdminPaymentEmailProps {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
}

export default function AdminPaymentEmail(data: AdminPaymentEmailProps) {
  const formattedDate = new Date(data.paidAt).toLocaleString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Dakar',
  });
  const adminUrl = `${SITE_URL}/admin/finances`;

  return (
    <Layout preview={`💰 Nouveau paiement : ${data.amount.toLocaleString('fr-FR')} ${data.currency} — ${data.courseTitle}`}>
      <Text style={{ color: '#111827', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
        💰 Nouveau paiement reçu
      </Text>
      <Text style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 24px 0' }}>
        {formattedDate} (heure de Dakar)
      </Text>

      {/* Amount highlight — fond solide (compatible Outlook, pas de gradient) */}
      <Section style={{
        backgroundColor: '#dcfce7',
        border: '2px solid #22c55e',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        <Text style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#166534', margin: '0 0 8px 0' }}>
          Montant encaissé
        </Text>
        <Text style={{ fontSize: '36px', fontWeight: '700', color: '#14532d', margin: '0 0 4px 0', lineHeight: '1' }}>
          {data.amount.toLocaleString('fr-FR')} {data.currency}
        </Text>
        <Text style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>
          via {data.paymentMethod}
        </Text>
      </Section>

      {/* Details table */}
      <Section style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <Text style={{ fontSize: '13px', color: '#111827', fontWeight: '700', margin: '0 0 12px 0' }}>
          Détails de la transaction
        </Text>
        {([
          ['👤 Étudiant', data.studentName],
          ['📧 Email', data.studentEmail],
          ['📚 Cours', data.courseTitle],
          ['💳 Moyen', data.paymentMethod],
          ['🔖 ID transaction', data.transactionId],
        ] as [string, string][]).map(([label, value]) => (
          <Text key={label} style={{ fontSize: '13px', color: '#374151', margin: '6px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
            <strong>{label} :</strong> {value}
          </Text>
        ))}
      </Section>

      <Button href={adminUrl} style={btnStyle('#0f1b3d')}>Voir dans le tableau admin →</Button>
    </Layout>
  );
}

export async function adminNewPaymentTemplate(data: AdminPaymentEmailProps): Promise<{ html: string; text: string }> {
  const formattedDate = new Date(data.paidAt).toLocaleString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Dakar',
  });
  return {
    html: await render(<AdminPaymentEmail {...data} />),
    text: `💰 Nouveau paiement reçu — Waraba Academy
${formattedDate}

Montant : ${data.amount.toLocaleString('fr-FR')} ${data.currency}
Étudiant : ${data.studentName} (${data.studentEmail})
Cours : ${data.courseTitle}
Moyen : ${data.paymentMethod}
ID transaction : ${data.transactionId}

Tableau admin : ${SITE_URL}/admin/finances`,
  };
}
