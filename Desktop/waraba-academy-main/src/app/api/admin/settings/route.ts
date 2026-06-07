import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, logAdminAction } from '@/middleware/adminAuth';
import { getAdminSupabaseClient } from '@/lib/supabase-server';
import { handleApiError } from '@/lib/errors';

const DEFAULT_SETTINGS: Record<string, unknown> = {
  siteName: 'Waraba Academy',
  siteDescription: 'Plateforme de formation en ligne',
  contactEmail: '',
  supportEmail: '',
  enableNotifications: true,
  enableEmailNotifications: true,
  maintenanceMode: false,
  allowRegistration: true,
};

// SECURITY: Only these keys can be written via the API
const ALLOWED_SETTING_KEYS = new Set(Object.keys(DEFAULT_SETTINGS));

// GET /api/admin/settings
async function GET() {
  try {
    const supabase = getAdminSupabaseClient();

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      // Table might not exist, return defaults
      console.warn('site_settings table error, returning defaults:', error.message);
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
    }

    const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    (data || []).forEach((row: any) => {
      settings[row.key] = row.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Erreur GET settings:', error);
    return handleApiError(error);
  }
}

// PUT /api/admin/settings
async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminSupabaseClient();
    const body = await request.json();

    // SECURITY: Filter to allowed keys only — prevent arbitrary key injection
    const entries = Object.entries(body).filter(([key]) => ALLOWED_SETTING_KEYS.has(key));

    if (entries.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucune clé de paramètre valide fournie',
      }, { status: 400 });
    }

    for (const [key, value] of entries) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key, value: value as any },
          { onConflict: 'key' }
        );

      if (error) {
        console.warn(`Erreur upsert setting "${key}":`, error.message);
        // If table doesn't exist, return gracefully
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return NextResponse.json({
            success: false,
            error: 'La table site_settings n\'existe pas. Créez-la avec: CREATE TABLE site_settings (key text PRIMARY KEY, value jsonb);',
          }, { status: 500 });
        }
      }
    }

    logAdminAction({
      user_id: (request as any).adminUser?.id || 'unknown',
      action: 'settings.update',
      resource: '/api/admin/settings',
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      success: true,
      details: { keys: Object.keys(body) },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Paramètres sauvegardés' });
  } catch (error) {
    console.error('Erreur PUT settings:', error);
    return handleApiError(error);
  }
}

export const GET_handler = withAdminAuth(GET);
export const PUT_handler = withAdminAuth(PUT);

export { GET_handler as GET, PUT_handler as PUT };
