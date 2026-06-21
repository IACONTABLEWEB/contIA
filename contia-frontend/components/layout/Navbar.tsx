'use client';

import { useRouter } from 'next/navigation';
import { borrarToken } from '@/lib/auth';

export function Navbar() {
  const router = useRouter();

  function handleLogout() {
    borrarToken();
    router.push('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div />
      <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900">
        Cerrar sesión
      </button>
    </header>
  );
}
