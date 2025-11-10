'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ClientTabs({ id, base = '/dashboard/staff/clients' }: { id: string; base?: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `${base}/${id}/about`, label: 'About' },
    { href: `${base}/${id}/timeline`, label: 'Timeline' },
    { href: `${base}/${id}/calendar`, label: 'Calendar' },
    { href: `${base}/${id}/community`, label: 'Community' },
    { href: `${base}/${id}/goals`, label: 'Goals' }, 
  ];

  return (
    <div className="mb-4 flex gap-6 border-b">
      {tabs.map(t => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'pb-2 text-sm',
              active
                ? 'font-medium border-b-2 border-zinc-900'
                : 'text-zinc-500 hover:text-zinc-800'
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
