import { NextResponse, type NextRequest } from 'next/server';

/**
 * Accès protégé par mot de passe de la démo (authentification HTTP Basic du navigateur).
 * Inactif tant que DEMO_PASSWORD n'est pas défini : aucun effet en production.
 */
export function proxy(request: NextRequest) {
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
