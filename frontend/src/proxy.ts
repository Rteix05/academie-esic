import { NextResponse, type NextRequest } from 'next/server';

/**
 * Avant chaque page :
 *  - redirection de www.* vers le domaine sans « www » ;
 *  - accès protégé par mot de passe de la démo (authentification HTTP Basic du navigateur),
 *    inactif tant que DEMO_PASSWORD n'est pas défini.
 */
export function proxy(request: NextRequest) {
  // Adresse unique www.esich.fr → esich.fr : l'API n'accepte que l'origine sans « www »
  // (cookie de session et CORS), et les moteurs ne voient qu'une adresse
  const host = request.headers.get('host') ?? '';
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    url.port = '';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  const password = process.env.DEMO_PASSWORD;
  if (!password) return NextResponse.next();

  const [scheme, encoded] = (request.headers.get('authorization') ?? '').split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = atob(encoded);
    // Identifiant libre : seul le mot de passe compte
    if (decoded.slice(decoded.indexOf(':') + 1) === password) {
      const res = NextResponse.next();
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return res;
    }
  }

  return new NextResponse('Accès réservé', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Academie ESIC - demo", charset="UTF-8"' },
  });
}

export const config = {
  // Ressources statiques de Next exclues : elles ne révèlent pas le contenu du site
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
