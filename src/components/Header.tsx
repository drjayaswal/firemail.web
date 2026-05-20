'use client';

import Image from 'next/image';
import { Search, DeleteIcon, RefreshCw, User, Wand2Icon, DatabaseBackupIcon, PowerIcon, CloudDownloadIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  analyzing: boolean;
  loading: boolean;
  onAnalyze: () => void;
  onLoadDataFromDatabase: () => void;
  analyzeDisabled?: boolean;
  onFetch: () => void;
  onSignOut: () => void;
  sessionUserEmail?: string | null;
}

export default function Header({
  searchTerm,
  setSearchTerm,
  analyzing,
  loading,
  onAnalyze,
  onLoadDataFromDatabase,
  analyzeDisabled = false,
  onSignOut,
  onFetch,
  sessionUserEmail,
}: HeaderProps) {
  return (
    <div className="flex min-w-0 max-w-full flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between sm:p-0 p-5 pb-0 lg:gap-6">
      <div className="shrink-0">
        <Image
          src="/assets/unmail-open-source.png"
          alt="Logo"
          width={160}
          height={50}
          className="h-auto w-auto max-w-[min(100%,200px)] object-contain sm:max-w-none"
          priority
        />
      </div>
      <div className="flex w-full min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center lg:w-auto">
        <div className="group relative w-full min-w-0 sm:max-w-xs sm:flex-1 lg:w-64 lg:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-accent" />
          <Input
            placeholder="Search inbox..."
            className="pl-9 pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute sm:-right-2 -right-1 top-1/2 flex h-11 min-h-11 hover:-translate-x-0.5 transition-transform duration-300 min-w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-black transition-colors hover:text-red-600"
              aria-label="Clear search"
            >
              <DeleteIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="w-full min-w-0 grid sm:grid-cols-4 grid-cols-2 gap-2 sm:w-auto sm:justify-end">
          <Button type="button" variant="accent" onClick={onAnalyze} disabled={analyzing || analyzeDisabled} className="shrink-0">
            <Wand2Icon />Analyze
          </Button>
          <Button type="button" variant="light" onClick={onFetch} disabled={loading} className="shrink-0">
            {loading ? <RefreshCw className="animate-spin" /> : <CloudDownloadIcon className="h-4 w-4" />}
            {loading ? 'Fetching' : 'Fetch'}
          </Button>
          <Button type="button" variant="light" onClick={onLoadDataFromDatabase} disabled={loading} className="shrink-0">
            {loading ? <DatabaseBackupIcon className="animate-pulse" /> : <DatabaseBackupIcon className="h-4 w-4" />}
            {loading ? 'Loading' : 'Load'}
          </Button>
          {sessionUserEmail ? (
            <>
              <Button
                type="button" variant="ghost" className="shrink-0"
                onClick={onSignOut}>
                <User className="fill-muted-foreground text-muted-foreground" />
                {sessionUserEmail.slice(0, 6) + "..."}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
