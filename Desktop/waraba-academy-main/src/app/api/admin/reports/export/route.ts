import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/middleware/adminAuth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';
import { apiLogger } from '@/lib/logger';

// GET /api/admin/reports/export - Exporter les rapports en CSV ou PDF
async function GET (request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const range = parseInt(searchParams.get('range') || '30');

    if (!['csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Format invalide. Utilisez "csv" ou "pdf"' },
        { status: 400 },
      );
    }

    // Calculer la date de début
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    const startDateISO = startDate.toISOString();

    // Récupérer les données pour le rapport
    const [usersData, coursesData, enrollmentsData, paymentsData] = await Promise.all([
      // Utilisateurs
      supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, created_at')
        .gte('created_at', startDateISO)
        .order('created_at', { ascending: false }),
      
      // Cours
      supabase
        .from('courses')
        .select('id, title, price, is_published, created_at')
        .gte('created_at', startDateISO)
        .order('created_at', { ascending: false }),
      
      // Inscriptions
      supabase
        .from('enrollments')
        .select('id, user_id, course_id, enrolled_at, status')
        .gte('enrolled_at', startDateISO)
        .order('enrolled_at', { ascending: false }),
      
      // Paiements
      supabase
        .from('payments')
        .select('id, user_id, course_id, amount, status, created_at')
        .gte('created_at', startDateISO)
        .eq('status', 'completed')
        .order('created_at', { ascending: false }),
    ]);

    if (format === 'csv') {
      // Générer le CSV
      const csvLines: string[] = [];
      
      // En-tête
      csvLines.push('RAPPORT WARABA ACADEMY');
      csvLines.push(`Période: ${range} derniers jours`);
      csvLines.push(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`);
      csvLines.push('');

      // Section Utilisateurs
      csvLines.push('=== UTILISATEURS ===');
      csvLines.push('Email,Prénom,Nom,Rôle,Date d\'inscription');
      if (usersData.data) {
        usersData.data.forEach((user: any) => {
          csvLines.push([
            user.email || '',
            user.first_name || '',
            user.last_name || '',
            user.role || '',
            new Date(user.created_at).toLocaleDateString('fr-FR'),
          ].join(','));
        });
      }
      csvLines.push('');

      // Section Cours
      csvLines.push('=== COURS ===');
      csvLines.push('Titre,Prix,Publié,Date de création');
      if (coursesData.data) {
        coursesData.data.forEach((course: any) => {
          csvLines.push([
            `"${course.title || ''}"`,
            course.price || 0,
            course.is_published ? 'Oui' : 'Non',
            new Date(course.created_at).toLocaleDateString('fr-FR'),
          ].join(','));
        });
      }
      csvLines.push('');

      // Section Inscriptions
      csvLines.push('=== INSCRIPTIONS ===');
      csvLines.push('ID Utilisateur,ID Cours,Date d\'inscription,Statut');
      if (enrollmentsData.data) {
        enrollmentsData.data.forEach((enrollment: any) => {
          csvLines.push([
            enrollment.user_id || '',
            enrollment.course_id || '',
            new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR'),
            enrollment.status || '',
          ].join(','));
        });
      }
      csvLines.push('');

      // Section Paiements
      csvLines.push('=== PAIEMENTS ===');
      csvLines.push('ID Utilisateur,ID Cours,Montant,Date,Statut');
      if (paymentsData.data) {
        paymentsData.data.forEach((payment: any) => {
          csvLines.push([
            payment.user_id || '',
            payment.course_id || '',
            payment.amount || 0,
            new Date(payment.created_at).toLocaleDateString('fr-FR'),
            payment.status || '',
          ].join(','));
        });
      }

      // Statistiques
      csvLines.push('');
      csvLines.push('=== STATISTIQUES ===');
      csvLines.push(`Total utilisateurs,${usersData.data?.length || 0}`);
      csvLines.push(`Total cours,${coursesData.data?.length || 0}`);
      csvLines.push(`Total inscriptions,${enrollmentsData.data?.length || 0}`);
      csvLines.push(`Total paiements,${paymentsData.data?.length || 0}`);
      const totalRevenue = paymentsData.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
      csvLines.push(`Revenus totaux,${totalRevenue} XOF`);

      const csvContent = csvLines.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rapport-waraba-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Pour PDF, on retourne un message indiquant que c'est en développement
      // ou on génère un HTML simple qui peut être converti en PDF côté client
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rapport Waraba Academy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #2563eb; color: white; }
    .summary { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Rapport Waraba Academy</h1>
  <p><strong>Période:</strong> ${range} derniers jours</p>
  <p><strong>Généré le:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
  
  <div class="summary">
    <h2>Résumé</h2>
    <p><strong>Total utilisateurs:</strong> ${usersData.data?.length || 0}</p>
    <p><strong>Total cours:</strong> ${coursesData.data?.length || 0}</p>
    <p><strong>Total inscriptions:</strong> ${enrollmentsData.data?.length || 0}</p>
    <p><strong>Total paiements:</strong> ${paymentsData.data?.length || 0}</p>
    <p><strong>Revenus totaux:</strong> ${paymentsData.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0} XOF</p>
  </div>
  
  <h2>Utilisateurs</h2>
  <table>
    <tr>
      <th>Email</th>
      <th>Prénom</th>
      <th>Nom</th>
      <th>Rôle</th>
      <th>Date d'inscription</th>
    </tr>
    ${usersData.data?.map((user: any) => `
      <tr>
        <td>${user.email || ''}</td>
        <td>${user.first_name || ''}</td>
        <td>${user.last_name || ''}</td>
        <td>${user.role || ''}</td>
        <td>${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
      </tr>
    `).join('') || '<tr><td colspan="5">Aucun utilisateur</td></tr>'}
  </table>
  
  <h2>Cours</h2>
  <table>
    <tr>
      <th>Titre</th>
      <th>Prix</th>
      <th>Publié</th>
      <th>Date de création</th>
    </tr>
    ${coursesData.data?.map((course: any) => `
      <tr>
        <td>${course.title || ''}</td>
        <td>${course.price || 0} XOF</td>
        <td>${course.is_published ? 'Oui' : 'Non'}</td>
        <td>${new Date(course.created_at).toLocaleDateString('fr-FR')}</td>
      </tr>
    `).join('') || '<tr><td colspan="4">Aucun cours</td></tr>'}
  </table>
  
  <h2>Paiements</h2>
  <table>
    <tr>
      <th>Montant</th>
      <th>Statut</th>
      <th>Date</th>
    </tr>
    ${paymentsData.data?.map((payment: any) => `
      <tr>
        <td>${payment.amount || 0} XOF</td>
        <td>${payment.status || ''}</td>
        <td>${new Date(payment.created_at).toLocaleDateString('fr-FR')}</td>
      </tr>
    `).join('') || '<tr><td colspan="3">Aucun paiement</td></tr>'}
  </table>
</body>
</html>
      `;

      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="rapport-waraba-${new Date().toISOString().split('T')[0]}.html"`,
        },
      });
    }
  } catch (error: unknown) {
    apiLogger.error('Erreur lors de l\'export du rapport', error);
    return handleApiError(error);
  }
}

// Wrapper avec authentification admin
export const GET_handler = withAdminAuth(GET);

export { GET_handler as GET };


