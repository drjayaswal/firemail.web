'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  show: boolean;
};

function pageLabel(pathname: string): string | null {
  if (pathname.startsWith('/admin')) return 'Admin';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname === '/') return 'Firebox';
  if (pathname.startsWith('/help')) return 'Help';
  if (pathname.startsWith('/privacy-policy')) return 'Privacy';
  if (pathname.startsWith('/terms-condition')) return 'Terms';
  return null;
}

export default function AppNavbar({
  authenticated,
  isAdmin
}: {
  authenticated: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = useMemo<NavItem[]>(
    () => [
      { href: '/', label: 'Firebox', show: authenticated },
      { href: '/profile', label: 'Profile', show: authenticated },
      { href: '/dashboard', label: 'Dashboard', show: authenticated },
      { href: '/admin', label: 'Admin', show: authenticated && isAdmin },
      { href: '/help', label: 'Help', show: true },
      { href: '/privacy-policy', label: 'Privacy', show: !authenticated },
      { href: '/terms-condition', label: 'Terms', show: !authenticated },
    ],
    [authenticated, isAdmin],
  );

  const visibleItems = items.filter((item) => item.show);
  const contextLabel = pageLabel(pathname);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-2 px-3 sm:h-12 sm:px-6">
          <Link
            href={authenticated ? '/' : '/'}
            className="flex min-w-0 items-center gap-2"
            onClick={closeMenu}
          >
              <Image
                src="/firemail-opensource.svg"
                alt="firemail"
                width={100}
                height={100}
                quality={90}
                style={{ width: '150px', height: 'auto' }}
                priority
              />
              <span className="truncate text-[10px] text-zinc-500 sm:text-xs">{contextLabel}</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            {visibleItems.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Button
                  key={item.href}
                  variant={active ? 'accent' : 'light'}
                  size="sm"
                // asChild
                >
                  {
                    item.href === '/' &&
                    <Image
                      src={active ? "/logo-nobg.svg" : "/logo.svg"}
                      alt="Firemail"
                      width={80}
                      height={28}
                      className="w-auto object-contain h-4"
                      style={{ width: 'auto' }}
                      priority
                    />
                  }
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>

          <Button
            type="button"
            variant="no_outline"
            size="icon-sm"
            className="h-8 w-8 sm:hidden text-black"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-black/20 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
            />
            <motion.nav
              aria-label="Mobile menu"
              className="fixed left-0 right-0 top-0 z-50 max-h-[min(70vh,320px)] overflow-y-auto bg-white shadow-lg sm:hidden"
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <ul className="flex flex-col gap-0.5 p-2">
                {visibleItems.map((item) => {
                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={cn(
                          'flex h-10 items-center rounded-lg px-3 text-sm transition-colors',
                          active
                            ? 'font-medium text-accent'
                            : 'text-zinc-700 hover:bg-zinc-50',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
