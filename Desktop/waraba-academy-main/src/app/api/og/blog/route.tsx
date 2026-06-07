import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Développement Web':      { bg: '#2563eb', text: '#dbeafe' },
  'Intelligence Artificielle': { bg: '#7c3aed', text: '#ede9fe' },
  'Marketing Digital':      { bg: '#059669', text: '#d1fae5' },
  'Entrepreneuriat':        { bg: '#d97706', text: '#fef3c7' },
  'Soft Skills':            { bg: '#db2777', text: '#fce7f3' },
  'Finance':                { bg: '#0891b2', text: '#cffafe' },
  'Design':                 { bg: '#ea580c', text: '#ffedd5' },
};

const DEFAULT_COLOR = { bg: '#1e40af', text: '#dbeafe' };

/**
 * GET /api/og/blog?title=...&category=...&date=...
 * Génère une image OG 1200×630 unique par article de blog.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title    = searchParams.get('title')    ?? 'Article de blog';
  const category = searchParams.get('category') ?? 'Général';
  const date     = searchParams.get('date')     ?? '';

  const color  = CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
  const formattedDate = date
    ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient décoratif */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color.bg}55 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color.bg}33 0%, transparent 70%)`,
          }}
        />

        {/* Barre de couleur en haut */}
        <div
          style={{
            height: '6px',
            background: color.bg,
            width: '100%',
          }}
        />

        {/* Contenu */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '56px 72px',
          }}
        >
          {/* Badge catégorie */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: color.bg,
                color: color.text,
                fontSize: '18px',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: '999px',
                letterSpacing: '0.5px',
              }}
            >
              {category}
            </div>
            {formattedDate && (
              <div
                style={{
                  color: '#64748b',
                  fontSize: '16px',
                }}
              >
                {formattedDate}
              </div>
            )}
          </div>

          {/* Titre */}
          <div
            style={{
              color: '#f8fafc',
              fontSize: title.length > 60 ? '44px' : '52px',
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: '900px',
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo texte */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: color.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '22px',
                  fontWeight: 800,
                }}
              >
                W
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 700 }}>
                  Waraba Academy
                </div>
                <div style={{ color: '#64748b', fontSize: '14px' }}>
                  Formation tech pour l'Afrique
                </div>
              </div>
            </div>

            <div
              style={{
                color: '#475569',
                fontSize: '15px',
                padding: '8px 16px',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            >
              waraba-academy.com/blog
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
