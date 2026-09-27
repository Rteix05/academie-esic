/**
 * Transforme le lien vidéo saisi dans l'admin en source affichable sur le site.
 *
 *  - YouTube, Vimeo, Google Drive : lecteur officiel intégré (iframe) ;
 *  - Dropbox, fichier direct (.mp4, .webm…) : balise <video> ;
 *  - pCloud : le lien de partage est résolu via l'API publique pCloud en lien de fichier direct ;
 *  - autre hébergeur : impossible à intégrer → ouverture dans un nouvel onglet.
 */

export type VideoSource =
  | { kind: 'iframe'; src: string; provider: string }
  | { kind: 'file'; src: string; provider: string }
  | { kind: 'pcloud'; code: string; apiHost: string; provider: string }
  | { kind: 'external'; src: string; provider: string };

const VIDEO_FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i;

export function resolveVideoSource(raw: string): VideoSource {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { kind: 'external', src: raw, provider: 'un service externe' };
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');

  // YouTube : youtu.be/ID, youtube.com/watch?v=ID, /shorts/ID, /embed/ID, /live/ID
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const id = host === 'youtu.be'
      ? url.pathname.slice(1).split('/')[0]
      : url.searchParams.get('v') ?? url.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
    if (id) {
      const start = url.searchParams.get('t') ?? url.searchParams.get('start');
      const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
      if (start) params.set('start', String(parseInt(start, 10) || 0));
      // Domaine « nocookie » : pas de cookie de suivi publicitaire avant la lecture
      return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}?${params}`, provider: 'YouTube' };
    }
  }

  // Vimeo : vimeo.com/ID ou vimeo.com/ID/HASH (vidéo non répertoriée), player.vimeo.com/video/ID
  if (host.endsWith('vimeo.com')) {
    const m = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/([\da-f]+))?/);
    if (m) {
      const hash = m[2] ?? url.searchParams.get('h');
      const params = new URLSearchParams({ dnt: '1', title: '0', byline: '0' });
      if (hash) params.set('h', hash);
      return { kind: 'iframe', src: `https://player.vimeo.com/video/${m[1]}?${params}`, provider: 'Vimeo' };
    }
  }

  // Google Drive : /file/d/ID/view → /file/d/ID/preview
  if (host === 'drive.google.com') {
    const id = url.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] ?? url.searchParams.get('id');
    if (id) return { kind: 'iframe', src: `https://drive.google.com/file/d/${id}/preview`, provider: 'Google Drive' };
  }

  // Dropbox : lien de partage → fichier brut lisible par <video>
  if (host.endsWith('dropbox.com')) {
    url.searchParams.delete('dl');
    url.searchParams.set('raw', '1');
    return { kind: 'file', src: url.toString(), provider: 'Dropbox' };
  }

  // pCloud : u.pcloud.link (US) / e.pcloud.link (UE) — publink/show?code=XXX
  if (host.endsWith('pcloud.link') || host.endsWith('pcloud.com')) {
    const code = url.searchParams.get('code');
    if (code) {
      const apiHost = host.startsWith('e.') || host.startsWith('e1.') || host.includes('eapi') ? 'eapi.pcloud.com' : 'api.pcloud.com';
      return { kind: 'pcloud', code, apiHost, provider: 'pCloud' };
    }
  }

  if (VIDEO_FILE.test(url.pathname)) {
    return { kind: 'file', src: url.toString(), provider: host };
  }

  return { kind: 'external', src: url.toString(), provider: host };
}

/**
 * Résout un lien de partage pCloud en lien de fichier direct (API publique, CORS autorisé).
 * Le lien obtenu est temporaire : il est redemandé à chaque affichage.
 */
export async function resolvePcloudFile(code: string, apiHost: string): Promise<string> {
  const res = await fetch(`https://${apiHost}/getpublinkdownload?code=${encodeURIComponent(code)}`);
  const data: { result: number; hosts?: string[]; path?: string; error?: string } = await res.json();
  if (data.result !== 0 || !data.hosts?.length || !data.path) {
    throw new Error(data.error || 'Lien pCloud invalide');
  }
  return `https://${data.hosts[0]}${data.path}`;
}
