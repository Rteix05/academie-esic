'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const HIDDEN_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.includes(pathname)) return null;
  return <Footer />;
}
