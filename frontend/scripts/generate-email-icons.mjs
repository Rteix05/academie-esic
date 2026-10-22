/**
 * Génère les icônes des emails transactionnels à partir des tracés de lucide-react.
 *
 * Les messageries (Gmail, Outlook…) n'affichent ni composants React ni SVG : chaque icône est
 * convertie en PNG blanc sur fond transparent (4× pour les écrans haute densité), puis intégrée
 * dans l'email en pièce jointe interne (CID) par le backend.
 *
 *   node scripts/generate-email-icons.mjs
 *
 * Sortie : backend/templates/emails/icons/<nom>.png
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ICONS = ['book-open', 'check', 'sparkles', 'graduation-cap', 'key-round', 'mail', 'calendar', 'arrow-right'];
const SIZE = 96; // affichées en 20-24 px dans les emails
const COLOR = '#FFFFFF';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, '..', 'backend', 'templates', 'emails', 'icons');
mkdirSync(outDir, { recursive: true });

const toAttrs = (attrs) =>
  Object.entries(attrs)
    .filter(([name]) => name !== 'key')
    .map(([name, value]) => `${name}="${String(value).replace(/"/g, '&quot;')}"`)
    .join(' ');

for (const name of ICONS) {
  const { __iconNode } = await import(`lucide-react/dist/esm/icons/${name}.mjs`);
  const body = __iconNode.map(([tag, attrs]) => `<${tag} ${toAttrs(attrs)}/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24" fill="none" stroke="${COLOR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(outDir, `${name}.png`));
  console.log(`✓ ${name}.png`);
}
