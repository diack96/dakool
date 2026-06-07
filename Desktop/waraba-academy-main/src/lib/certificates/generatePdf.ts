import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { LOGO_PNG_BASE64 } from './logo';
import { SIGNATURE_PNG_BASE64 } from './signature';

interface CertificateData {
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: Date;
  grade: number;
  verificationUrl: string;
}

/** French distinction label based on score */
function getMention(grade: number): string {
  if (grade >= 90) return 'avec les f\u00E9licitations du jury';
  if (grade >= 75) return 'avec mention Tr\u00E8s Bien';
  if (grade >= 60) return 'avec mention Bien';
  return 'avec mention Assez Bien';
}

/**
 * Bande Bogolan : rangée de petits carrés alternés (plein / vide).
 * horizontal=true → le long de l'axe X ; false → axe Y.
 */
function drawBogolonStrip(
  doc: PDFKit.PDFDocument,
  x: number, y: number,
  length: number,
  horizontal: boolean,
  sq: number,
  darkColor: string,
  lightColor: string,
) {
  const count = Math.floor(length / sq);
  for (let i = 0; i < count; i++) {
    const rx = horizontal ? x + i * sq : x;
    const ry = horizontal ? y : y + i * sq;
    doc.rect(rx, ry, sq, sq).fill(i % 2 === 0 ? darkColor : lightColor);
  }
}

/**
 * Bloc de coin Bogolan — grille 5×5 avec motif croix (mudcloth).
 * Le bloc est centré sur (cx, cy).
 */
function drawBogolonCorner(
  doc: PDFKit.PDFDocument,
  cx: number, cy: number,
  size: number,
  dark: string,
  accent: string,
) {
  // Motif croix Bogolan typique : 1=sombre, 0=clair
  const pattern = [
    [1, 0, 1, 0, 1],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1],
  ];
  const cell = size / 5;
  const ox = cx - size / 2;
  const oy = cy - size / 2;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      doc.rect(ox + c * cell, oy + r * cell, cell - 0.5, cell - 0.5)
        .fill((pattern[r]?.[c] ?? 0) ? dark : accent);
    }
  }
}

/**
 * Diviseur Bogolan : double rangée de carrés alternés + losange central.
 */
function drawBogolonDivider(
  doc: PDFKit.PDFDocument,
  cx: number, y: number,
  halfWidth: number,
  dark: string,
  accent: string,
) {
  const sq = 8;
  const count = Math.floor(halfWidth / sq);
  const startX = cx - count * sq;
  const total = count * 2;

  // Rangée du haut
  for (let i = 0; i < total; i++) {
    doc.rect(startX + i * sq, y - sq - 1, sq - 1, sq - 1)
      .fill(i % 2 === 0 ? dark : accent);
  }
  // Rangée du bas
  for (let i = 0; i < total; i++) {
    doc.rect(startX + i * sq, y + 1, sq - 1, sq - 1)
      .fill(i % 2 === 0 ? accent : dark);
  }

  // Losange central
  const d = 7;
  doc.save().translate(cx, y).rotate(45);
  doc.rect(-d / 2, -d / 2, d, d).fill(dark);
  doc.restore();
}

/**
 * Médaillon africain en filigrane :
 * carrés concentriques à 45° + croix orthogonale + diagonales.
 * Inspiré des motifs Bogolan / Adinkra.
 */
function drawAfricanMedallion(doc: PDFKit.PDFDocument, cx: number, cy: number) {
  // Carrés concentriques : alternance bleu marine / orange (couleurs du logo)
  const squareRings: [number, string][] = [
    [140, '#1E3A8A'],
    [108, '#F97316'],
    [76,  '#1E3A8A'],
    [46,  '#F97316'],
  ];
  for (const [s, color] of squareRings) {
    doc.save().translate(cx, cy).rotate(45);
    doc
      .rect(-s / 2, -s / 2, s, s)
      .lineWidth(s === 108 ? 1.8 : 0.7)
      .strokeColor(color)
      .stroke();
    doc.restore();
  }

  // Croix orthogonale — bleu marine
  const arm = 95;
  doc.save()
    .lineWidth(0.9).strokeColor('#1E3A8A')
    .moveTo(cx - arm, cy).lineTo(cx + arm, cy).stroke()
    .moveTo(cx, cy - arm).lineTo(cx, cy + arm).stroke();
  doc.restore();

  // Diagonales légères — orange
  const d = 68;
  doc.save()
    .lineWidth(0.4).strokeColor('#F97316')
    .moveTo(cx - d, cy - d).lineTo(cx + d, cy + d).stroke()
    .moveTo(cx + d, cy - d).lineTo(cx - d, cy + d).stroke();
  doc.restore();

  // Petits carrés sur les axes : bleu / orange alternés (motif Bogolan)
  const dotPos = [30, 60, 90];
  const ds = 5;
  for (const p of dotPos) {
    const pts: [number, number, string][] = [
      [p,  0,  '#1E3A8A'],
      [-p, 0,  '#F97316'],
      [0,  p,  '#F97316'],
      [0,  -p, '#1E3A8A'],
    ];
    for (const [dx, dy, fillColor] of pts) {
      doc.save().translate(cx + dx, cy + dy).rotate(45);
      doc.rect(-ds / 2, -ds / 2, ds, ds).fill(fillColor);
      doc.restore();
    }
  }
}

/**
 * Génère un certificat A4-paysage avec motifs Bogolan africains.
 * Palette : brun terre / ocre / terracotta sur fond parchemin chaud.
 */
export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  const { studentName, courseTitle, certificateNumber, issuedAt, grade, verificationUrl } = data;

  const W = 841.89;
  const H = 595.28;
  const cx = W / 2;

  const doc = new PDFDocument({
    size: [W, H],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    info: {
      Title: `Certificat \u2013 ${courseTitle}`,
      Author: 'Waraba Academy',
      Subject: `Certificat d\u2019ach\u00E8vement \u2013 ${studentName}`,
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // ── Palette : marque Waraba + héritage Bogolan ────────────────────────────
  // Couleurs issues du logo SVG
  const brandBlue    = '#1E3A8A';  // bleu marine (primary-900) — base structurelle
  const brandMidBlue = '#2563EB';  // bleu vif (primary-600)  — "ACADEMY" dans le logo
  const brandSkyBlue = '#0EA5E9';  // bleu ciel — dégradé du logo
  const brandOrange  = '#F97316';  // orange (secondary-500) — "WARABA" dans le logo
  // Compléments Bogolan / patrimoine africain
  const cream      = '#FAF3E0';  // fond parchemin chaud
  const parchment  = '#F2E8D0';  // zone centrale légèrement plus sombre
  const ochre      = '#D4A017';  // ocre doré (gold-500 de la charte)
  const slate      = '#1E293B';  // texte secondaire (bleu nuit)
  const lightSlate = '#64748B';  // texte léger

  // ── Fond ──────────────────────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill(cream);
  doc.rect(38, 38, W - 76, H - 76).fill(parchment);

  // ── Filigrane médaillon africain ──────────────────────────────────────────
  doc.save();
  doc.opacity(0.07);
  drawAfricanMedallion(doc, cx, H / 2);
  doc.opacity(1);
  doc.restore();

  // ── Cadre extérieur Bogolan — couleurs de la marque ──────────────────────
  const barThick  = 12;  // épaisseur barre pleine
  const stripH    = 16;  // hauteur de la bande à motifs
  const sq        = stripH / 2;       // = 8 — taille d'un carré du motif
  const frameEdge = barThick + stripH; // = 28

  // Barres pleines (4 côtés) — bleu marine de la marque
  doc.rect(0, 0, W, barThick).fill(brandBlue);
  doc.rect(0, H - barThick, W, barThick).fill(brandBlue);
  doc.rect(0, 0, barThick, H).fill(brandBlue);
  doc.rect(W - barThick, 0, barThick, H).fill(brandBlue);

  // Bandes Bogolan — horizontales (haut & bas)
  // Orange + bleu = couleurs directes du logo "WARABA ACADEMY"
  const hLen = W - 2 * barThick;
  drawBogolonStrip(doc, barThick, barThick,      hLen, true, sq, brandOrange, brandMidBlue);
  drawBogolonStrip(doc, barThick, barThick + sq, hLen, true, sq, brandMidBlue, brandOrange);
  drawBogolonStrip(doc, barThick, H - frameEdge,      hLen, true, sq, brandOrange, brandMidBlue);
  drawBogolonStrip(doc, barThick, H - frameEdge + sq, hLen, true, sq, brandMidBlue, brandOrange);

  // Bandes Bogolan — verticales (gauche & droite)
  const vLen = H - 2 * frameEdge;
  const vY   = frameEdge;
  drawBogolonStrip(doc, barThick,      vY, vLen, false, sq, brandOrange, brandMidBlue);
  drawBogolonStrip(doc, barThick + sq, vY, vLen, false, sq, brandMidBlue, brandOrange);
  drawBogolonStrip(doc, W - frameEdge,      vY, vLen, false, sq, brandOrange, brandMidBlue);
  drawBogolonStrip(doc, W - frameEdge + sq, vY, vLen, false, sq, brandMidBlue, brandOrange);

  // Coins Bogolan — bleu marine + orange
  const cHalf = frameEdge / 2; // 14
  drawBogolonCorner(doc, cHalf,     cHalf,     frameEdge, brandBlue, brandOrange);
  drawBogolonCorner(doc, W - cHalf, cHalf,     frameEdge, brandBlue, brandOrange);
  drawBogolonCorner(doc, cHalf,     H - cHalf, frameEdge, brandBlue, brandOrange);
  drawBogolonCorner(doc, W - cHalf, H - cHalf, frameEdge, brandBlue, brandOrange);

  // Filets intérieurs — ocre + bleu ciel (dégradé du logo)
  const m = frameEdge + 6;
  doc.lineWidth(1.5).strokeColor(ochre).rect(m, m, W - 2 * m, H - 2 * m).stroke();
  doc.lineWidth(0.5).strokeColor(brandSkyBlue).rect(m + 4, m + 4, W - 2 * (m + 4), H - 2 * (m + 4)).stroke();

  // ── Logo ──────────────────────────────────────────────────────────────────
  let logoBottomY = 48;
  try {
    const logoBuffer = Buffer.from(LOGO_PNG_BASE64, 'base64');
    const logoW = 120;
    const logoH = 70;
    doc.image(logoBuffer, cx - logoW / 2, 46, {
      width: logoW, height: logoH,
      fit: [logoW, logoH],
      align: 'center', valign: 'center',
    });
    logoBottomY = 46 + logoH + 6;
  } catch {
    doc.fontSize(16).fillColor(brandBlue).font('Times-Bold')
      .text('WARABA ACADEMY', 0, 58, { align: 'center', width: W });
    logoBottomY = 88;
  }

  // ── Diviseur Bogolan après logo ────────────────────────────────────────────
  drawBogolonDivider(doc, cx, logoBottomY + 14, 160, brandBlue, ochre);

  // ── Titre principal ────────────────────────────────────────────────────────
  const titleY = logoBottomY + 38;
  doc.fontSize(26).fillColor(brandBlue).font('Times-Bold')
    .text("CERTIFICAT D'ACH\u00C8VEMENT", 0, titleY, {
      align: 'center', width: W, characterSpacing: 3,
    });

  doc.fontSize(10).fillColor(brandOrange).font('Helvetica-Oblique')
    .text('de Formation en Ligne \u2013 Waraba Academy', 0, titleY + 34, {
      align: 'center', width: W,
    });

  // ── "Décerné à" + nom de l'étudiant ───────────────────────────────────────
  const awardY = titleY + 60;
  doc.fontSize(10).fillColor(slate).font('Helvetica')
    .text('Ce certificat est d\u00E9cern\u00E9 \u00E0', 0, awardY, { align: 'center', width: W });

  const nameY = awardY + 20;
  doc.fontSize(33).fillColor(brandBlue).font('Times-BoldItalic')
    .text(studentName, 90, nameY, { align: 'center', width: W - 180 });

  // Soulignement Bogolan : barre orange + carrés alternés bleu/ocre
  const underY = nameY + 44;
  doc.rect(cx - 160, underY, 320, 3).fill(brandOrange);
  const uSq = 7;
  for (let i = 0; i < 9; i++) {
    const px = cx - 148 + i * 37;
    doc.rect(px - uSq / 2, underY - uSq / 2 + 1.5, uSq, uSq)
      .fill(i % 2 === 0 ? brandBlue : ochre);
  }

  // ── Info cours ─────────────────────────────────────────────────────────────
  const courseIntroY = underY + 18;
  doc.fontSize(10).fillColor(slate).font('Helvetica')
    .text('pour avoir compl\u00E9t\u00E9 avec succ\u00E8s le cours', 0, courseIntroY, {
      align: 'center', width: W,
    });

  const courseTitleY = courseIntroY + 18;
  doc.fontSize(17).fillColor(brandBlue).font('Times-Bold')
    .text(courseTitle, 100, courseTitleY, { align: 'center', width: W - 200 });

  // ── Mention ────────────────────────────────────────────────────────────────
  const mentionY = courseTitleY + 36;
  doc.fontSize(10).fillColor(brandOrange).font('Helvetica-BoldOblique')
    .text(getMention(grade), 0, mentionY, { align: 'center', width: W });

  // ── Date + numéro de certificat ────────────────────────────────────────────
  const dateY = mentionY + 22;
  const formattedDate = issuedAt.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  doc.fontSize(9).fillColor(slate).font('Helvetica')
    .text(`D\u00E9livr\u00E9 le ${formattedDate}`, 0, dateY, { align: 'center', width: W });
  doc.fontSize(8).fillColor(lightSlate).font('Helvetica')
    .text(`N\u00B0 ${certificateNumber}`, 0, dateY + 14, { align: 'center', width: W });

  // ── Diviseur Bogolan avant signatures ──────────────────────────────────────
  drawBogolonDivider(doc, cx, dateY + 36, 200, brandBlue, ochre);

  // ── Signatures ─────────────────────────────────────────────────────────────
  const sigY   = dateY + 52;
  const leftX  = 140;
  const rightX = W - 300;
  const sigW   = 160;

  // Gauche – CEO Fondateur
  doc.fontSize(8.5).fillColor(brandBlue).font('Times-Bold')
    .text('Papa Abdou Khader Diack', leftX, sigY, { width: sigW, align: 'center' });
  doc.rect(leftX, sigY + 14, sigW, 2).fill(brandOrange);
  doc.fontSize(7).fillColor(lightSlate).font('Helvetica')
    .text('CEO Fondateur', leftX, sigY + 20, { width: sigW, align: 'center' });
  if (SIGNATURE_PNG_BASE64) {
    try {
      const sigBuffer = Buffer.from(SIGNATURE_PNG_BASE64, 'base64');
      doc.image(sigBuffer, leftX + 5, sigY + 34, {
        width: sigW - 10, height: 75,
        fit: [sigW - 10, 75],
        align: 'center', valign: 'center',
      });
    } catch { /* image de signature indisponible */ }
  }

  // Droite – Direction Pédagogique
  doc.rect(rightX, sigY + 28, sigW, 2).fill(brandOrange);
  doc.fontSize(8.5).fillColor(brandBlue).font('Times-Bold')
    .text('Direction P\u00E9dagogique', rightX, sigY + 33, { width: sigW, align: 'center' });
  doc.fontSize(7).fillColor(lightSlate).font('Helvetica')
    .text('Waraba Academy', rightX, sigY + 46, { width: sigW, align: 'center' });

  // ── QR code (bas-droite) ───────────────────────────────────────────────────
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 88, margin: 1,
      color: { dark: brandBlue, light: cream },
    });
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    const qrX = W - 110;
    const qrY = H - 112;
    // Cadre double style Bogolan autour du QR
    doc.rect(qrX - 4, qrY - 4, 68, 68).lineWidth(2).strokeColor(brandOrange).stroke();
    doc.rect(qrX - 7, qrY - 7, 74, 74).lineWidth(0.5).strokeColor(ochre).stroke();
    doc.image(qrBuffer, qrX, qrY, { width: 60, height: 60 });
    doc.fontSize(7).fillColor(lightSlate).font('Helvetica')
      .text('V\u00E9rifier l\u2019authenticit\u00E9', qrX - 5, qrY + 63, { width: 70, align: 'center' });
  } catch {
    doc.fontSize(7).fillColor(lightSlate).font('Helvetica')
      .text(verificationUrl, W - 230, H - 56, { width: 195, align: 'right' });
  }

  // ── Pied de page ───────────────────────────────────────────────────────────
  doc.fontSize(7).fillColor(lightSlate).font('Helvetica')
    .text(
      `V\u00E9rifiable en ligne\u00A0: ${verificationUrl}`,
      46, H - 36,
      { width: W - 175, align: 'left' },
    );

  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}
