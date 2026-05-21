'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Loader from './Loader';
import AdminCategories from './AdminCategory';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export default function Admin({
  sessionAdminId,
}: {
  sessionAdminId?: string | null;
}) {
  const [appLoading, setAppLoading] = useState(true);

  if (appLoading) {
    return <Loader onComplete={() => setAppLoading(false)} />;
  }

  return (
    <div className="min-h-0 text-black">
      <header className="flex flex-col gap-4 border-b border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-4">
          <Image
            src="/firemail-opensource.svg"
            alt="Firemail"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          <span className="hidden h-6 w-px bg-black/10 sm:block" />
          <span className="text-sm text-zinc-500">Admin</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="light" size="sm" asChild>
            <Link href="/">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to app
            </Link>
          </Button>
          {sessionAdminId && (
            <>
            <span className="sm:inline hidden truncate text-sm text-black">{sessionAdminId}</span>
            <span className="sm:hidden inline-block truncate text-sm text-black">{sessionAdminId.slice(0, 6)}...</span>
            </>
          )}
        </div>
      </header>

      <main className="p-8 lg:p-12">
        <AdminCategories />
      </main>
    </div>
  );
}
