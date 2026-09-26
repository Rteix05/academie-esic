'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const HIDDEN_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return <Navbar />;
}
