import Link from 'next/link';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/empresas', label: 'Empresas' },
  { href: '/balances/comparar', label: 'Comparar balances' },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-slate-200 bg-white p-4">
      <div className="mb-8 text-lg font-semibold">ContIA</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
